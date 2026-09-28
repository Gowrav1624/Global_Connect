# Test Cases

| ID | Area | Test | Expected Result |
|---|---|---|---|
| TC-01 | Registration | Register with valid data | Account is created |
| TC-02 | Registration | Register with invalid/duplicate data | Validation/error is shown |
| TC-03 | Login | Login with valid credentials | User is authenticated |
| TC-04 | Login | Login with invalid credentials | Request is rejected |
| TC-05 | Authorization | Access protected API without token | Access is denied |
| TC-06 | Profile | Update valid profile data | Profile is updated |
| TC-07 | Connections | Send connection request | Request is created |
| TC-08 | Posts | Create valid post | Post is stored/displayed |
| TC-09 | Messaging | Send message to authorized user | Message is delivered/stored |
| TC-10 | Jobs | View valid job information | Job information is displayed |
| TC-11 | Notifications | Trigger supported notification event | Notification is created |
| TC-12 | Admin | Non-admin accesses admin endpoint | Access is denied |
| TC-13 | Admin | Authorized admin performs valid action | Action succeeds |
| TC-14 | Deployment | Load deployed frontend | Application loads |
| TC-15 | API | Backend health/API check | Expected response is returned |
