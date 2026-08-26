# Diagrammes UML

## Cas d’utilisation

```mermaid
usecaseDiagram
actor Admin
actor User
actor Visiteur
Admin --> (Gérer utilisateurs)
Admin --> (Consulter dashboard admin)
Admin --> (Exporter rapports)
User --> (Ajouter entrée financière)
User --> (Ajouter sortie financière)
User --> (Gérer fidèles)
User --> (Gérer obligations)
User --> (Gérer communion)
Visiteur --> (Consulter dashboard lecture seule)
Visiteur --> (Voir graphiques)
```

## Classes principales

```mermaid
classDiagram
class Controller
class Model
class Router
class AuthService
class FinanceService
class User
class Fidel
class FinanceEntry
class FinanceExit
class Obligation
class CommunionPayment
Controller <|-- DashboardController
Controller <|-- FinanceController
Controller <|-- FidelController
Model <|-- User
Model <|-- Fidel
Model <|-- FinanceEntry
Model <|-- FinanceExit
Model <|-- Obligation
Model <|-- CommunionPayment
AuthService --> User
FinanceService --> FinanceEntry
FinanceService --> FinanceExit
```
