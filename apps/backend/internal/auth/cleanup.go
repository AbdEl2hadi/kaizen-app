package auth

import "context"

func (service *Service) CleanupDaily(ctx context.Context) error {
	if err := service.query.DailyDeleteLoginAttempts(ctx); err != nil {
		return err
	}
	return service.query.DailyDeleteUsersWithEmailNotVerified(ctx)
}
