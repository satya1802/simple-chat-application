# Data Model

<!-- sdlc:auto:start entities -->
### users

| Field | Type | PK | FK | Nullable |
|---|---|---|---|---|
| id | uuid | True | — | False |
| email | citext | False | — | False |
| password_hash | text | False | — | False |
| created_at | timestamptz | False | — | False |

### conversations

| Field | Type | PK | FK | Nullable |
|---|---|---|---|---|
| id | uuid | True | — | False |
| user_id | uuid | False | users.id | False |
| title | varchar(120) | False | — | False |
| created_at | timestamptz | False | — | False |
| last_activity_at | timestamptz | False | — | False |

### messages

| Field | Type | PK | FK | Nullable |
|---|---|---|---|---|
| id | uuid | True | — | False |
| conversation_id | uuid | False | conversations.id | False |
| role | varchar(16) | False | — | False |
| content | text | False | — | False |
| created_at | timestamptz | False | — | False |

### password_reset_tokens

| Field | Type | PK | FK | Nullable |
|---|---|---|---|---|
| id | uuid | True | — | False |
| user_id | uuid | False | users.id | False |
| token_hash | text | False | — | False |
| expires_at | timestamptz | False | — | False |
| used_at | timestamptz | False | — | True |
| created_at | timestamptz | False | — | False |
<!-- sdlc:auto:end entities -->

<!-- sdlc:auto:start relationships -->
| Source | Target | Type |
|---|---|---|
| users | conversations | one-to-many |
| conversations | messages | one-to-many |
| users | password_reset_tokens | one-to-many |
<!-- sdlc:auto:end relationships -->

<!-- sdlc:auto:start er-diagram -->
```mermaid
erDiagram
  users {
    uuid id PK
    citext email
    text password_hash
    timestamptz created_at
  }
  conversations {
    uuid id PK
    uuid user_id FK
    varchar_120_ title
    timestamptz created_at
    timestamptz last_activity_at
  }
  messages {
    uuid id PK
    uuid conversation_id FK
    varchar_16_ role
    text content
    timestamptz created_at
  }
  password_reset_tokens {
    uuid id PK
    uuid user_id FK
    text token_hash
    timestamptz expires_at
    timestamptz used_at
    timestamptz created_at
  }
  users ||--o{ conversations : "one-to-many"
  conversations ||--o{ messages : "one-to-many"
  users ||--o{ password_reset_tokens : "one-to-many"
```
<!-- sdlc:auto:end er-diagram -->
