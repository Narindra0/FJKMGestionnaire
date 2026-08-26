<?php
/*
 | Commentaire technique
 | Ce fichier contient un contrôleur MVC : il reçoit les requêtes, appelle les services ou modèles nécessaires, puis renvoie la vue ou la réponse adaptée.
 */
namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Core\Session;
use App\Core\Validator;
use App\Models\Fidel;
use App\Models\AuditLog;
use App\Services\QrCodeService;


/* Chrétien (ancien Fidèles) : base mpiangona. */
final class FidelController extends Controller
{
    public function index(): void
    {
        $model = new Fidel();
        $this->view('fideles/index', [
            'title' => 'Chrétien (mpiangona)',
            'fideles' => $model->all('id DESC'),
            'nextMatricule' => $model->nextMatricule(),
        ]);
    }

    public function create(): void
    {
        $this->redirect('fideles');
    }

    public function store(): void
    {
        $v = (new Validator())->required($_POST, ['matricule','full_name']);
        if ($v->fails()) {
            Session::flash('error', 'Nom et matricule obligatoires.');
            $this->redirect('fideles');
        }

        $model = new Fidel();
        $matricule = trim($_POST['matricule'] ?? '');
        if ($model->findByMatricule($matricule)) {
            Session::flash('error', 'Matricule déjà utilisé : impossible d’enregistrer deux chrétiens avec le même matricule.');
            $this->redirect('fideles');
        }

        $createdDate = $this->validDate($_POST['created_date'] ?? '') ?: date('Y-m-d');

        $photo = $this->uploadPhoto();
        $id = $model->create($this->payload() + [
            'photo' => $photo,
            'created_by' => Auth::id(),
            'created_at' => $createdDate . ' ' . date('H:i:s'),
        ]);
        (new AuditLog())->record(Auth::id(), 'CREATE_CHRISTIANE', 'fideles', $id, $_POST);
        Session::flash('success', 'Chrétien enregistré.');
        $this->redirect('fideles');
    }

    public function update(int $id): void
    {
        $model = new Fidel();
        $row = $model->find($id);
        if (!$this->canModify($row)) {
            Session::flash('error', 'Modification refusée : USER peut modifier uniquement les saisies d’aujourd’hui.');
            $this->redirect('fideles');
        }
        $v = (new Validator())->required($_POST, ['full_name']);
        if ($v->fails()) {
            Session::flash('error', 'Nom obligatoire.');
            $this->redirect('fideles');
        }
        $matricule = trim($_POST['matricule'] ?? '');
        $duplicate = $matricule !== '' ? $model->findByMatricule($matricule) : null;
        if ($duplicate && (int)$duplicate['id'] !== $id) {
            Session::flash('error', 'Matricule déjà utilisé : modification refusée.');
            $this->redirect('fideles');
        }
        $data = $this->payload(true) + ['updated_at' => date('Y-m-d H:i:s')];
        $createdDate = $this->validDate($_POST['created_date'] ?? '');
        if ($createdDate) {
            $currentTime = substr((string)($row['created_at'] ?? ''), 11, 8) ?: '00:00:00';
            $data['created_at'] = $createdDate . ' ' . $currentTime;
        }
        $photo = $this->uploadPhoto();
        if ($photo) $data['photo'] = $photo;
        $model->update($id, $data);
        (new AuditLog())->record(Auth::id(), 'UPDATE_CHRISTIANE', 'fideles', $id, $_POST);
        Session::flash('success', 'Chrétien modifié.');
        $this->redirect('fideles');
    }

    public function delete(int $id): void
    {
        (new Fidel())->delete($id);
        (new AuditLog())->record(Auth::id(), 'DELETE_CHRISTIANE', 'fideles', $id, []);
        Session::flash('success', 'Chrétien supprimé.');
        $this->redirect('fideles');
    }

    public function show(int $id): void
    {
        $model = new Fidel();
        $fidel = $model->withFinancialStatus($id);
        if (!$fidel) { http_response_code(404); exit('Chrétien introuvable'); }
        $qr = new QrCodeService();
        $this->view('fideles/profile', [
            'title' => 'Fiche Chrétien',
            'fidel' => $fidel,
            'obligations' => $model->obligations($id),
            'communionHistory' => $model->communionHistory($id),
            'qr' => $qr->svgDataUri($qr->memberPayload($fidel)),
        ]);
    }

    public function card(int $id): void
    {
        $fidel = (new Fidel())->find($id);
        if (!$fidel) { http_response_code(404); exit('Chrétien introuvable'); }
        $qr = new QrCodeService();
        $this->view('fideles/card', ['title' => 'Carte membre', 'fidel' => $fidel, 'qr' => $qr->svgDataUri($qr->memberPayload($fidel))], 'layouts/print');
    }

    private function payload(bool $withMatricule = true): array

    {
        $data = [
            'full_name' => trim($_POST['full_name'] ?? ''),
            'gender' => $_POST['gender'] ?? null,
            'birth_date' => normalize_date($_POST['birth_date'] ?? '') ?: null,
            'phone' => substr(trim($_POST['phone'] ?? ''), 0, 13),
            'group_name' => trim($_POST['group_name'] ?? ''),
            'address' => trim($_POST['address'] ?? ''),
            'status' => $_POST['status'] ?? 'active',
            'baptized_at' => normalize_date($_POST['baptized_at'] ?? '') ?: null,
            'communion_at' => normalize_date($_POST['communion_at'] ?? '') ?: null,
        ];
        if ($withMatricule) $data['matricule'] = trim($_POST['matricule'] ?? '');
        return $data;
    }

    private function uploadPhoto(): ?string
    {
        if (empty($_FILES['photo']['name'])) return null;
        $app = config_app();
        if ($_FILES['photo']['size'] > $app['upload_max_size']) return null;
        $ext = strtolower(pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $app['allowed_images'], true)) return null;
        $dir = BASE_PATH . '/public/uploads/fideles';
        if (!is_dir($dir)) mkdir($dir, 0775, true);
        $name = uniqid('fidel_', true) . '.' . $ext;
        move_uploaded_file($_FILES['photo']['tmp_name'], $dir . '/' . $name);
        return 'uploads/fideles/' . $name;
    }
}
