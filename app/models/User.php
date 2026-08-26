<?php
/*
 | Commentaire technique
 | Ce fichier contient un modèle : il centralise les requêtes SQL et les opérations liées à une table de la base de données.
 */
namespace App\Models;

use App\Core\Model;

/* Utilisateurs applicatifs : authentification, rôles, activation, suppression contrôlée et mot de passe. */
final class User extends Model
{
    protected string $table = 'users';

    public function findWithRole(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=:id LIMIT 1");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function findByEmail(string $email): ?array
    {
        return $this->findByIdentifier($email);
    }

    public function findByIdentifier(string $identifier): ?array
    {
        $identifier = trim($identifier);
        $like = '%' . $identifier . '%';

        // Chaque placeholder est volontairement unique.
        // Avec PDO/MySQL en préparation native, réutiliser le même nom (:q, :exact)
        // plusieurs fois dans une requête peut provoquer SQLSTATE[HY093].
        $withMatricule = "SELECT u.*, r.name AS role_name
                FROM users u JOIN roles r ON r.id=u.role_id
                WHERE u.email = :email_exact OR u.name = :name_exact OR u.matricule = :matricule_exact
                   OR u.email LIKE :email_like OR u.name LIKE :name_like OR u.matricule LIKE :matricule_like
                ORDER BY CASE
                    WHEN u.email = :email_order OR u.name = :name_order OR u.matricule = :matricule_order THEN 0
                    ELSE 1
                END, u.id ASC
                LIMIT 1";
        $withoutMatricule = "SELECT u.*, r.name AS role_name
                FROM users u JOIN roles r ON r.id=u.role_id
                WHERE u.email = :email_exact OR u.name = :name_exact
                   OR u.email LIKE :email_like OR u.name LIKE :name_like
                ORDER BY CASE
                    WHEN u.email = :email_order OR u.name = :name_order THEN 0
                    ELSE 1
                END, u.id ASC
                LIMIT 1";
        try {
            $stmt = $this->db->prepare($withMatricule);
            $stmt->execute([
                'email_exact' => $identifier,
                'name_exact' => $identifier,
                'matricule_exact' => $identifier,
                'email_like' => $like,
                'name_like' => $like,
                'matricule_like' => $like,
                'email_order' => $identifier,
                'name_order' => $identifier,
                'matricule_order' => $identifier,
            ]);
        } catch (\Throwable $e) {
            $stmt = $this->db->prepare($withoutMatricule);
            $stmt->execute([
                'email_exact' => $identifier,
                'name_exact' => $identifier,
                'email_like' => $like,
                'name_like' => $like,
                'email_order' => $identifier,
                'name_order' => $identifier,
            ]);
        }
        return $stmt->fetch() ?: null;
    }

    public function createUser(array $data): int
    {
        $stmt = $this->db->prepare("INSERT INTO users(role_id, name, matricule, email, password, status, created_at) VALUES(:role_id,:name,:matricule,:email,:password,:status,NOW())");
        $stmt->execute([
            'role_id' => (int)($data['role_id'] ?? 0),
            'name' => trim($data['name'] ?? ''),
            'matricule' => trim($data['matricule'] ?? '') !== '' ? trim($data['matricule']) : null,
            'email' => trim($data['email'] ?? ''),
            'password' => password_hash((string)($data['password'] ?? ''), PASSWORD_DEFAULT),
            'status' => ($data['status'] ?? 'active') === 'inactive' ? 'inactive' : 'active',
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function allWithRoles(): array
    {
        return $this->db->query("SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id=u.role_id ORDER BY u.id DESC")->fetchAll();
    }

    public function roles(): array
    {
        return $this->db->query("SELECT * FROM roles WHERE name <> 'PATRON' ORDER BY FIELD(name,'ADMIN','USER','VISITEUR'), id")->fetchAll();
    }

    public function touchLastLogin(int $id): void
    {
        $this->db->prepare("UPDATE users SET last_login_at=NOW() WHERE id=:id")->execute(['id' => $id]);
    }

    public function recordLoginAttempt(string $email, string $ip, bool $success): void
    {
        $stmt = $this->db->prepare("INSERT INTO login_attempts(email, ip_address, success, attempted_at) VALUES(:email,:ip,:success,NOW())");
        $stmt->execute(['email' => $email, 'ip' => $ip, 'success' => $success ? 1 : 0]);
    }

    public function tooManyAttempts(string $email, string $ip, int $max, int $minutes): bool
    {
        $minutes = max(1, $minutes);
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM login_attempts WHERE email=:email AND ip_address=:ip AND success=0 AND attempted_at >= DATE_SUB(NOW(), INTERVAL {$minutes} MINUTE)");
        $stmt->execute(['email' => $email, 'ip' => $ip]);
        return (int)$stmt->fetchColumn() >= $max;
    }

    public function storeRememberToken(int $id, string $hash): void
    {
        $this->db->prepare("UPDATE users SET remember_token=:token WHERE id=:id")->execute(['token' => $hash, 'id' => $id]);
    }

    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->db->prepare("UPDATE users SET status=:status, updated_at=NOW() WHERE id=:id");
        return $stmt->execute(['status' => $status, 'id' => $id]);
    }

    public function changePassword(int $id, string $password): bool
    {
        $stmt = $this->db->prepare("UPDATE users SET password=:password, updated_at=NOW() WHERE id=:id");
        return $stmt->execute(['password' => password_hash($password, PASSWORD_DEFAULT), 'id' => $id]);
    }

    public function updateRole(int $id, int $roleId): bool
    {
        $stmt = $this->db->prepare("UPDATE users SET role_id=:role_id, updated_at=NOW() WHERE id=:id");
        return $stmt->execute(['role_id' => $roleId, 'id' => $id]);
    }

    public function updateProfile(int $id, array $data): bool
    {
        $fields = ['name=:name', 'email=:email', 'matricule=:matricule', 'role_id=:role_id', 'status=:status', 'updated_at=NOW()'];
        $params = [
            'name' => trim($data['name'] ?? ''),
            'email' => trim($data['email'] ?? ''),
            'matricule' => trim($data['matricule'] ?? '') !== '' ? trim($data['matricule']) : null,
            'role_id' => (int)($data['role_id'] ?? 0),
            'status' => ($data['status'] ?? 'active') === 'inactive' ? 'inactive' : 'active',
            'id' => $id,
        ];
        if (!empty($data['password'])) {
            $fields[] = 'password=:password';
            $params['password'] = password_hash((string)$data['password'], PASSWORD_DEFAULT);
        }
        $stmt = $this->db->prepare('UPDATE users SET '.implode(', ', $fields).' WHERE id=:id');
        return $stmt->execute($params);
    }
}
