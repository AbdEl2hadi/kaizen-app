package main

import (
	"fmt"
	"log"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/env"
	"github.com/joho/godotenv"
)

func newApp() *application {
	// get PORT from .env
	port := env.GetString("PORT" , "8000")

	app := &application{
		config: config{
			addr: fmt.Sprintf(":%s", port),
		},
	}
	return app
}

func main() {
	if err := godotenv.Load("../../.env"); err != nil {
		log.Fatal("Error loading .env file")
	}

	app := newApp()

	r := app.route()

	fmt.Printf("server started on http://localhost%s\n" , app.config.addr)

	log.Fatal(app.run(r))

}
