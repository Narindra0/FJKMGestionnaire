# MLD professionnel

```text
roles(id, name, description, created_at)
users(id, role_id#, name, email, password, status, remember_token, last_login_at, created_at, updated_at)
settings(id, key, value, created_at)
periods(id, name, start_date, end_date, status, created_at)
fideles(id, matricule, full_name, gender, birth_date, phone, address, baptized_at, communion_at, photo, status, created_by#, created_at, updated_at)
finance_entries(id, label, category, amount, payment_method, reference, operation_date, description, created_by#, created_at, updated_at)
finance_exits(id, label, category, amount, beneficiary, reference, operation_date, description, created_by#, created_at, updated_at)
obligations(id, fidel_id#, period_id#, label, amount_due, amount_paid, status, due_date, created_by#, created_at, updated_at)
communion_payments(id, fidel_id#, amount, payment_date, payment_method, reference, created_by#, created_at)
login_attempts(id, email, ip_address, success, attempted_at)
audit_logs(id, user_id#, action, entity, entity_id, ip_address, user_agent, payload, created_at)
```
