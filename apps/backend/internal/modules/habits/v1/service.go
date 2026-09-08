package v1

import (
	"context"
	"encoding/json/jsontext"
	"encoding/json/v2"
	"fmt"
	"log"

	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"

	"uuid"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/cache"
	goRedis "github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/cache/redis"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/config"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/apperrors"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db     *pgxpool.Pool
	query  *sqlc.Queries
	config *config.Config
	cache  cache.ICache
}

func NewService(db *pgxpool.Pool, config *config.Config, c cache.ICache) *Service {
	return &Service{
		db:     db,
		query:  sqlc.New(db),
		config: config,
		cache:  c,
	}
}

func validateInputConfig(inputType sqlc.HabitInputType, config InputConfigType) error {
	switch inputType {
	case sqlc.HabitInputTypeSelect, sqlc.HabitInputTypeMultiselect:
		if len(config.Options) == 0 {
			return errors.New("select/multiselect requires at least one option")
		}
		seen := make(map[string]bool, len(config.Options))
		for _, opt := range config.Options {
			if strings.TrimSpace(opt) == "" {
				return errors.New("options cannot be empty")
			}
			if seen[opt] {
				return fmt.Errorf("duplicate option: %s", opt)
			}
			seen[opt] = true
		}
	case sqlc.HabitInputTypeNumber:
		if config.Target < 0 {
			return errors.New("target cannot be negative")
		}
	case sqlc.HabitInputTypePercent:
		if config.Target < 0 || config.Target > 100 {
			return errors.New("percent target must be between 0 and 100")
		}
	default:
		if len(config.Options) != 0 || config.Target != 0 {
			return errors.New("input config is not allowed for this input type")
		}
	}
	return nil
}

func toHabitDTO(id uuid.UUID, name string, icon string, inputType sqlc.HabitInputType, inputConfig jsontext.Value, sortOrder int, isActive bool) HabitDTO {
	return HabitDTO{
		ID:        id.String(),
		Name:      name,
		Icon:      icon,
		Input:     HabitInputDTO{Type: inputType, Config: inputConfig},
		SortOrder: sortOrder,
		IsActive:  isActive,
	}
}

func (service *Service) CreateHabit(ctx context.Context, userId uuid.UUID, payload HabitPostRequest) (HabitDTO, error) {
	if err := validateInputConfig(payload.InputType, payload.InputConfig); err != nil {
		return HabitDTO{}, apperrors.NewAppError(http.StatusBadRequest, err.Error())
	}

	id := uuid.NewV7()

	inputConfig, err := json.Marshal(payload.InputConfig)
	if err != nil {
		return HabitDTO{}, err
	}

	habit, err := service.query.CreateHabit(ctx, sqlc.CreateHabitParams{
		ID:          id,
		UserID:      userId,
		HabitName:   payload.Name,
		Icon:        payload.Icon,
		SortOrder:   payload.SortOrder,
		InputType:   payload.InputType,
		InputConfig: jsontext.Value(inputConfig),
	})
	if err != nil {
		return HabitDTO{}, err
	}

	return toHabitDTO(habit.ID, habit.HabitName, habit.Icon, habit.InputType, habit.InputConfig, habit.SortOrder, habit.IsActive), nil
}

func (service *Service) GetHabits(ctx context.Context, userId uuid.UUID, archived bool) ([]HabitDTO, error) {
	rows, err := service.query.GetHabits(ctx, sqlc.GetHabitsParams{
		UserID:   userId,
		IsActive: !archived,
	})
	if err != nil {
		return nil, err
	}

	habits := make([]HabitDTO, 0, len(rows))
	for _, row := range rows {
		habits = append(habits, toHabitDTO(row.ID, row.HabitName, row.Icon, row.InputType, row.InputConfig, row.SortOrder, row.IsActive))
	}
	return habits, nil
}

func (service *Service) DeleteHabit(ctx context.Context, userId uuid.UUID, habitID uuid.UUID) error {
	return service.query.SetIsActiveHabit(ctx, sqlc.SetIsActiveHabitParams{
		IsActive: false,
		ID:       habitID,
		UserID:   userId,
	})
}

func (service *Service) RestoreHabit(ctx context.Context, userId uuid.UUID, habitID uuid.UUID) error {
	return service.query.SetIsActiveHabit(ctx, sqlc.SetIsActiveHabitParams{
		IsActive: true,
		ID:       habitID,
		UserID:   userId,
	})
}

func (service *Service) UpdateHabit(ctx context.Context, userId uuid.UUID, habitID uuid.UUID, payload HabitPatchRequest) (HabitDTO, error) {
	if payload.Name == nil && payload.Icon == nil && payload.InputType == nil && payload.InputConfig == nil && payload.SortOrder == nil {
		return HabitDTO{}, ErrNoFieldsToUpdate
	}

	if payload.InputConfig != nil && payload.InputType != nil {
		if err := validateInputConfig(*payload.InputType, *payload.InputConfig); err != nil {
			return HabitDTO{}, apperrors.NewAppError(http.StatusBadRequest, err.Error())
		}
	} else if payload.InputConfig != nil || payload.InputType != nil {
		existing, err := service.query.GetHabit(ctx, sqlc.GetHabitParams{ID: habitID, UserID: userId})
		if err != nil {
			return HabitDTO{}, err
		}

		effectiveType := existing.InputType
		if payload.InputType != nil {
			effectiveType = *payload.InputType
		}

		effectiveConfigRaw := existing.InputConfig
		if payload.InputConfig != nil {
			effectiveConfigRaw, _ = json.Marshal(payload.InputConfig)
		}

		var cfg InputConfigType
		err = json.Unmarshal([]byte(effectiveConfigRaw), &cfg)
		if err != nil {
			return HabitDTO{}, err
		}
		if errValidation := validateInputConfig(effectiveType, cfg); errValidation != nil {
			return HabitDTO{}, apperrors.NewAppError(http.StatusBadRequest, errValidation.Error())
		}
	}

	params := sqlc.UpdateHabitParams{
		ID:     habitID,
		UserID: userId,
	}
	if payload.Name != nil {
		params.HabitName = pgtype.Text{String: *payload.Name, Valid: true}
	}
	if payload.Icon != nil {
		params.Icon = pgtype.Text{String: *payload.Icon, Valid: true}
	}
	if payload.InputType != nil {
		params.InputType = sqlc.NullHabitInputType{
			HabitInputType: *payload.InputType,
			Valid:          true,
		}
	}
	if payload.InputConfig != nil {
		inputConfig, err := json.Marshal(payload.InputConfig)
		if err != nil {
			return HabitDTO{}, err
		}
		params.InputConfig = inputConfig
	}
	if payload.SortOrder != nil {
		params.SortOrder = pgtype.Int4{Int32: int32(*payload.SortOrder), Valid: true}
	}

	habit, err := service.query.UpdateHabit(ctx, params)
	if err != nil {
		return HabitDTO{}, err
	}
	return toHabitDTO(habit.ID, habit.HabitName, habit.Icon, habit.InputType, habit.InputConfig, habit.SortOrder, habit.IsActive), nil
}

func (service *Service) GetLogs(ctx context.Context, userId uuid.UUID, startDate, endDate time.Time) ([]HabitDTO, error) {

	LogsKey := goRedis.LogsKey(service.config.AppEnv, userId, startDate, endDate)

	habitsCached, found, err := cache.Load[[]HabitDTO](ctx, service.cache, LogsKey)

	switch {
	case err != nil:
		log.Printf("getLogs cache miss %s", err)
	case found:
		log.Printf("getLogs cache hit %s ", LogsKey)
		return habitsCached, nil

	}

	rows, err := service.query.GetUserHabitsWithLogs(ctx, sqlc.GetUserHabitsWithLogsParams{
		UserID: userId,
		Column1: pgtype.Date{
			Time:  startDate,
			Valid: true,
		},
		Column2: pgtype.Date{
			Time:  endDate,
			Valid: true,
		},
	})
	if err != nil {
		return nil, err
	}

	habits := make([]HabitDTO, 0)
	for _, row := range rows {
		if len(habits) == 0 || habits[len(habits)-1].ID != row.HabitID.String() {
			habits = append(habits, toHabitDTO(row.HabitID, row.HabitName, row.Icon, row.InputType, row.InputConfig, row.SortOrder, true))
			habits[len(habits)-1].Logs = []HabitLogDTO{}
		}
		if row.EntryDate.Valid && row.LogValue != nil {
			last := &habits[len(habits)-1]
			last.Logs = append(last.Logs, HabitLogDTO{
				Date:  row.EntryDate.Time.Format("2006-01-02"),
				Value: row.LogValue,
			})
		}
	}

	_ = service.cache.Set(ctx, LogsKey, habits, 10*time.Minute)

	return habits, nil
}

func CalculatePreviousWeek(date time.Time) (startDate, endDate time.Time) {
	date = date.UTC()

	weekday := int(date.Weekday()) // Sunday = 0

	// Start of current week
	currentWeekStart := date.AddDate(0, 0, -weekday)

	// Previous week
	startDate = currentWeekStart.AddDate(0, 0, -7)
	endDate = currentWeekStart.AddDate(0, 0, -1)

	return startDate, endDate
}

func CalculatePreviousMonth(date time.Time) (startDate, endDate time.Time) {
	date = date.UTC()

	currentMonthStart := time.Date(
		date.Year(),
		date.Month(),
		1,
		0, 0, 0, 0,
		time.UTC,
	)

	startDate = currentMonthStart.AddDate(0, -1, 0)
	endDate = currentMonthStart.AddDate(0, 0, -1)

	return startDate, endDate
}

func CalculateAffectedWeek(date time.Time) (startDate, endDate time.Time, ok bool) {
	date = date.UTC()
	now := time.Now().UTC()

	// Normalize both dates to midnight UTC.
	date = time.Date(
		date.Year(), date.Month(), date.Day(),
		0, 0, 0, 0,
		time.UTC,
	)

	now = time.Date(
		now.Year(), now.Month(), now.Day(),
		0, 0, 0, 0,
		time.UTC,
	)

	// Calculate the week containing the modified log.
	weekday := int(date.Weekday()) // Sunday = 0

	startDate = date.AddDate(0, 0, -weekday)
	endDate = startDate.AddDate(0, 0, 6)

	// Calculate the previous completed week.
	nowWeekday := int(now.Weekday())
	previousWeekStart := now.AddDate(0, 0, -nowWeekday-7)

	return startDate, endDate, startDate.Equal(previousWeekStart)
}

func CalculateAffectedMonth(date time.Time) (startDate, endDate time.Time, ok bool) {
	date = date.UTC()
	now := time.Now().UTC()

	// Normalize to midnight UTC.
	date = time.Date(
		date.Year(), date.Month(), date.Day(),
		0, 0, 0, 0,
		time.UTC,
	)

	now = time.Date(
		now.Year(), now.Month(), now.Day(),
		0, 0, 0, 0,
		time.UTC,
	)

	// Calculate the month containing the modified log.
	startDate = time.Date(
		date.Year(),
		date.Month(),
		1,
		0, 0, 0, 0,
		time.UTC,
	)

	endDate = startDate.AddDate(0, 1, -1)

	// Calculate the previous completed month.
	previousMonthStart := time.Date(
		now.Year(),
		now.Month()-1,
		1,
		0, 0, 0, 0,
		time.UTC,
	)

	return startDate, endDate, startDate.Equal(previousMonthStart)
}

func (service *Service) SetLog(ctx context.Context, userID uuid.UUID, habitID uuid.UUID, date time.Time, value jsontext.Value) error {
	row, err := service.query.GetHabitForValidation(ctx, sqlc.GetHabitForValidationParams{ID: habitID, UserID: userID})
	if err != nil {
		return err // pgx.ErrNoRows → 404 correctly for archived/other-use
	}

	var raw any
	if err := json.Unmarshal(value, &raw); err != nil {
		return apperrors.NewAppError(http.StatusBadRequest, "invalid log value")
	}

	switch row.InputType {
	case sqlc.HabitInputTypeNumber, sqlc.HabitInputTypePercent:
		n, ok := raw.(float64)
		if !ok {
			return apperrors.NewAppError(http.StatusBadRequest, "value must be a number")
		}
		if row.InputType == sqlc.HabitInputTypePercent && (n < 0 || n > 100) {
			return apperrors.NewAppError(http.StatusBadRequest, "percent value must be between 0 and 100")
		}
		if row.InputType == sqlc.HabitInputTypeNumber {
			var cfg InputConfigType
			if err := json.Unmarshal(row.InputConfig, &cfg); err == nil && cfg.Target > 0 && n > float64(cfg.Target) {
				return apperrors.NewAppError(http.StatusBadRequest, fmt.Sprintf("value cannot exceed target %d", cfg.Target))
			}
		}
	case sqlc.HabitInputTypeCheckbox:
		if _, ok := raw.(bool); !ok {
			return apperrors.NewAppError(http.StatusBadRequest, "value must be a boolean")
		}
	case sqlc.HabitInputTypeSelect, sqlc.HabitInputTypeMultiselect:
		var cfg InputConfigType
		if err := json.Unmarshal(row.InputConfig, &cfg); err != nil {
			return apperrors.NewAppError(http.StatusBadRequest, "invalid habit input config")
		}
		contains := func(opt string) bool {
			for _, o := range cfg.Options {
				if o == opt {
					return true
				}
			}
			return false
		}
		if row.InputType == sqlc.HabitInputTypeMultiselect {
			options, ok := raw.([]any)
			if !ok {
				return apperrors.NewAppError(http.StatusBadRequest, "value must be an array of options")
			}
			for _, opt := range options {
				option, ok := opt.(string)
				if !ok || !contains(option) {
					return apperrors.NewAppError(http.StatusBadRequest, "value contains an unknown option")
				}
			}
		} else {
			option, ok := raw.(string)
			if !ok || !contains(option) {
				return apperrors.NewAppError(http.StatusBadRequest, "value must be a known option")
			}
		}
	case sqlc.HabitInputTypeDate:
		s, ok := raw.(string)
		if !ok {
			return apperrors.NewAppError(http.StatusBadRequest, "value must be a string")
		}
		if _, err = time.Parse("2006-01-02", s); err != nil {
			return apperrors.NewAppError(http.StatusBadRequest, "value must be a valid date (YYYY-MM-DD)")
		}
	case sqlc.HabitInputTypeUrl:
		s, ok := raw.(string)
		if !ok {
			return apperrors.NewAppError(http.StatusBadRequest, "value must be a string")
		}
		u, err := url.Parse(s)
		if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
			return apperrors.NewAppError(http.StatusBadRequest, "value must be a valid URL")
		}
	default: // text, files
		s, ok := raw.(string)
		if !ok {
			return apperrors.NewAppError(http.StatusBadRequest, "value must be a string")
		}
		if len(s) > maxTextValueLen {
			return apperrors.NewAppError(http.StatusBadRequest, fmt.Sprintf("value is too long (max %d characters)", maxTextValueLen))
		}
	}

	err = service.query.SetUserHabitLog(ctx, sqlc.SetUserHabitLogParams{
		Value:  value,
		UserID: userID,
		ID:     habitID,
		Column3: pgtype.Date{
			Time:  date,
			Valid: true,
		},
	})
	if err != nil {
		return err
	}

	// Cache invalidation
	weekStart, weekEnd, okWeek := CalculateAffectedWeek(date)
	monthStart, monthEnd, okMonth := CalculateAffectedMonth(date)

	if okWeek {
		weekKey := goRedis.LogsKey(service.config.AppEnv, userID, weekStart, weekEnd)
		_ = service.cache.Delete(ctx, weekKey)
	}

	if okMonth {
		monthKey := goRedis.LogsKey(service.config.AppEnv, userID, monthStart, monthEnd)
		_ = service.cache.Delete(ctx, monthKey)
	}

	return nil
}
