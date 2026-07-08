package main

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type application struct {
	config config 
}

type config struct {
	addr string
}

func (app *application) route() http.Handler {
	r:= chi.NewRouter()
	
	// A good base middleware stack
  	r.Use(middleware.RequestID)
  	r.Use(middleware.ClientIPFromRemoteAddr) 
  	r.Use(middleware.Logger)
  	r.Use(middleware.Recoverer)

	// Set a timeout value on the request context (ctx), that will signal.
	// through ctx.Done() that the request has timed out and further.
   	// processing should be stopped.
	r.Use(middleware.Timeout(60 * time.Second))


	r.Get("/" , home)

	r.Route("/v1" ,func(r chi.Router) {
		r.Get("/health" , app.healthCheckHandler)
	})

	
	return r
}

func home(w http.ResponseWriter , r *http.Request) {
	w.Write([]byte("server started"))
} 

func (app *application) run(mux http.Handler) error {
	server := &http.Server{
		Addr : app.config.addr,
		Handler: mux,

	}
	
	return server.ListenAndServe()
}
