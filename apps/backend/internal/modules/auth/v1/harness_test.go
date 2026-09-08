package v1

import (
	"context"
	"encoding/json/v2"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/AbdEl2hadi/kaizen-app/apps/backend/internal/utils/httpx"
	"github.com/go-chi/chi/v5"
	"github.com/markbates/goth/gothic"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type handlerCase struct {
	name         string
	method       string
	path         string
	body         string
	token        string
	cookie       string
	prepare      func(t *testing.T, req *http.Request)
	setup        func(*mockAuthService)
	wantStatus   int
	wantCode     string
	wantCalls    int
	wantLocation string
}

func runHandlerTests(t *testing.T, newHandler func(*mockAuthService) http.HandlerFunc, cases []handlerCase) {
	t.Helper()
	for _, tt := range cases {
		t.Run(tt.name, func(t *testing.T) {
			service := &mockAuthService{}
			if tt.setup != nil {
				tt.setup(service)
			}

			var body io.Reader
			if tt.body != "" {
				body = strings.NewReader(tt.body)
			}
			req := httptest.NewRequest(tt.method, tt.path, body)
			req.Header.Set("Content-Type", "application/json")
			if tt.token != "" {
				q := req.URL.Query()
				q.Set("token", tt.token)
				req.URL.RawQuery = q.Encode()
			}
			if tt.cookie != "" {
				req.AddCookie(&http.Cookie{Name: "session_token", Value: tt.cookie})
			}
			if tt.prepare != nil {
				tt.prepare(t, req)
			}

			res := httptest.NewRecorder()
			newHandler(service).ServeHTTP(res, req)

			require.Equal(t, tt.wantStatus, res.Code)
			if tt.wantLocation != "" {
				assert.Equal(t, tt.wantLocation, res.Header().Get("Location"))
			}
			if tt.wantCode != "" {
				var apiResp httpx.APIResponse[any]
				require.NoError(t, json.Unmarshal(res.Body.Bytes(), &apiResp))
				assert.Equal(t, tt.wantCode, apiResp.Code)
			}
			assert.Equal(t, tt.wantCalls, service.calls)
		})
	}
}

func prepareProviderParam(provider string) func(t *testing.T, req *http.Request) {
	return func(t *testing.T, req *http.Request) {
		rctx := chi.NewRouteContext()
		rctx.URLParams.Add("provider", provider)
		*req = *req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	}
}

func prepareGothCallback(provider string) func(t *testing.T, req *http.Request) {
	return func(t *testing.T, req *http.Request) {
		prepareProviderParam(provider)(t, req)

		storeReq := httptest.NewRequest(http.MethodGet, "/auth/"+provider+"/callback", nil)
		storeRes := httptest.NewRecorder()
		require.NoError(t, gothic.StoreInSession(provider, "mock-session-data", storeReq, storeRes))
		for _, c := range storeRes.Result().Cookies() {
			req.AddCookie(c)
		}
	}
}
