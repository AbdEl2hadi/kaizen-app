package v1

import (
	"encoding/json/jsontext"
	"errors"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/db/sqlc"
)

var ErrNoFieldsToUpdate = errors.New("no fields to update")

const maxTextValueLen = 1000

type InputConfigType struct {
	Options []string `json:"options,omitempty"`
	Target  int      `json:"target,omitempty"`
}
type HabitPostRequest struct {
	Name        string             `json:"name" validate:"required,max=100"`
	Icon        string             `json:"icon" validate:"required,max=50"`
	InputType   sqlc.HabitInputType `json:"inputType" validate:"required,oneof=checkbox text number select multiselect percent date files url"`
	InputConfig InputConfigType    `json:"inputConfig,omitempty"`
	SortOrder   int                `json:"sortOrder" validate:"required"`
}
type HabitPatchRequest struct {
	Name        *string             `json:"name" validate:"omitempty,max=100"`
	Icon        *string             `json:"icon" validate:"omitempty,max=50"`
	InputType   *sqlc.HabitInputType `json:"inputType" validate:"omitempty,oneof=checkbox text number select multiselect percent date files url"`
	InputConfig *InputConfigType    `json:"inputConfig"`
	SortOrder   *int                `json:"sortOrder"`
}

type HabitInputDTO struct {
	Type   sqlc.HabitInputType `json:"type"`
	Config jsontext.Value            `json:"config"`
}

type HabitLogDTO struct {
	Date  string         `json:"date"`
	Value jsontext.Value `json:"value"`
}

type HabitDTO struct {
	ID        string        `json:"id"`
	Name      string        `json:"name"`
	Icon      string        `json:"icon"`
	Input     HabitInputDTO `json:"input"`
	SortOrder int           `json:"sortOrder"`
	IsActive  bool          `json:"isActive"`
	Logs      []HabitLogDTO `json:"logs,omitempty"`
}

type SetHabitLogRequest struct {
	Value jsontext.Value `json:"value" validate:"required"`
}
