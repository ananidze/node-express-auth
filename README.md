# Node Express JWT Authentication / Authorization Example

### Default Routes

| Path | Method | Description |
| - | - | - |
| `/api/login` | `POST` | Authenticate user, returns JWT token.|
| `/api/sign-up` | `POST` | Create new user|
| `/api/refresh` | `POST` | Update Access Token |
| `/api/logout` | `DELETE` | Logout User |
| `/api/protected` | `GET` | Protected Route |