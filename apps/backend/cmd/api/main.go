package main

import (
	"log"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/app"
)

func main() {

	application, err := app.NewApp()
	if err != nil {
		log.Fatal(err)
	}

	log.Fatal(application.Start())

}
