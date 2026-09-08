package config

import (
	"log"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Config struct {
	Port            string `env:"PORT" envDefault:":8080"`
	DataBaseURL     string `env:"DATABASE_URL,required"`
	RedisURL        string `env:"REDIS_URL,required"`
	TestDataBaseURL string `env:"TEST_DATABASE_URL,required"`
	JWTSecret       string `env:"JWT_SECRET,required"`
	FrontendURL     string `env:"FRONTEND_URL,required"`
	BackendURL      string `env:"BACKEND_URL,required"`
	AppEnv          string `env:"APP_ENV" envDefault:"development"`
	GothSecret      string `env:"GOTH_SECRET,required"`
	SMTP            SMTPConfig
	Google          GoogleConfig
	Facebook        FacebookConfig
}
type SMTPConfig struct {
	Host string `env:"SMTP_HOST,required"`
	Port string `env:"SMTP_PORT,required"`

	Username string `env:"SMTP_USER,required"`
	Password string `env:"SMTP_PASS,required"`
	From     string `env:"SMTP_FROM,required"`
}

type GoogleConfig struct {
	ClientID string `env:"GOOGLE_CLIENT_ID,required"`
	Secret   string `env:"GOOGLE_CLIENT_SECRET,required"`
}
type FacebookConfig struct {
	ClientID string `env:"FACEBOOK_CLIENT_ID,required"`
	Secret   string `env:"FACEBOOK_CLIENT_SECRET,required"`
}

func Load() (*Config, error) {
	if err := godotenv.Load("../../.env.local"); err != nil {
		log.Fatal("Error loading .env file")
	}
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, err
	}
	return cfg, nil
}
