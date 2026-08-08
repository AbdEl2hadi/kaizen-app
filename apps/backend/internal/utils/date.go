package utils

import (
	"fmt"
	"strings"
	"time"
)

type Date time.Time

const layout = "2006-01-02"

func (d *Date) UnmarshalJSON(data []byte) error {
	s := strings.Trim(string(data), `"`)
	if s == "" || s == "null" {
		return nil
	}
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return fmt.Errorf("invalid date format, expected YYYY-MM-DD: %w", err)
	}
	*d = Date(t)
	return nil
}

func (d Date) MarshalJSON() ([]byte, error) {
	t := time.Time(d)
	if t.IsZero() {
		return []byte("null"), nil
	}
	return []byte(fmt.Sprintf(`"%s"`, t.Format(layout))), nil
}

func (d Date) Time() time.Time {
	return time.Time(d)
}

func (d Date) String() string {
	return time.Time(d).Format(layout)
}
