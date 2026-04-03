<?php

namespace App\Service;

class FileUploader
{
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    private const MAX_DIMENSIONS = ['width' => 4000, 'height' => 4000];
    private const COMPRESSION_QUALITY = 80; // 0-100

    /**
     * Valider et traiter l'upload d'une image en base64
     * 
     * @param string $base64Data Format: "data:image/jpeg;base64,..."
     * @param string $fieldName Nom du champ (pour les messages d'erreur)
     * @return string Base64 validée et compressée
     * @throws \InvalidArgumentException
     */
    public function validateAndProcessBase64(string $base64Data, string $fieldName = 'image'): string
    {
        // Vérifier le format data:// URI
        if (!preg_match('/^data:([a-zA-Z0-9\/+]+);base64,(.+)$/', $base64Data, $matches)) {
            throw new \InvalidArgumentException("Format de fichier invalide pour $fieldName");
        }

        $mimeType = $matches[1];
        $base64 = $matches[2];

        // Valider le type MIME
        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            throw new \InvalidArgumentException(
                "Type d'image non autorisé pour $fieldName. Types acceptés: " . implode(', ', self::ALLOWED_MIME_TYPES)
            );
        }

        // Décoder et valider la taille
        $binaryData = base64_decode($base64, true);
        if ($binaryData === false) {
            throw new \InvalidArgumentException("Données base64 invalides pour $fieldName");
        }

        if (strlen($binaryData) > self::MAX_FILE_SIZE) {
            throw new \InvalidArgumentException(
                "Fichier trop volumineux pour $fieldName (max: " . 
                (self::MAX_FILE_SIZE / 1024 / 1024) . "MB)"
            );
        }

        // Tenter de compresser l'image
        try {
            return $this->compressBase64Image($base64Data, $mimeType);
        } catch (\Exception $e) {
            // Si la compression échoue, retourner l'original avec un log
            error_log("Compression échouée pour $fieldName: " . $e->getMessage());
            return $base64Data;
        }
    }

    /**
     * Compresser une image base64
     * 
     * @param string $base64Data Format: "data:image/jpeg;base64,..."
     * @param string $mimeType Type MIME de l'image
     * @return string Image compressée au format data://
     */
    private function compressBase64Image(string $base64Data, string $mimeType): string
    {
        // Si GD n'est pas disponible, retourner l'original
        if (!extension_loaded('gd')) {
            return $base64Data;
        }

        try {
            // Extraire le base64 pur
            $base64Pure = preg_replace('/^data:[a-zA-Z0-9\/]+;base64,/', '', $base64Data);
            $binaryData = base64_decode($base64Pure, true);

            // Créer une image à partir des données
            $image = imagecreatefromstring($binaryData);
            if ($image === false) {
                return $base64Data; // Retourner l'original si on ne peut pas parser
            }

            // Vérifier et limiter les dimensions
            $width = imagesx($image);
            $height = imagesy($image);

            if ($width > self::MAX_DIMENSIONS['width'] || $height > self::MAX_DIMENSIONS['height']) {
                $image = $this->resizeImage($image, $width, $height);
            }

            // Compresser selon le type
            $output = match ($mimeType) {
                'image/jpeg' => $this->imageToJpegBase64($image),
                'image/png' => $this->imageToPngBase64($image),
                'image/webp' => $this->imageToWebpBase64($image),
                default => $base64Data, // Retourner l'original pour GIF et autres
            };

            imagedestroy($image);
            return $output;
        } catch (\Exception $e) {
            error_log("Erreur lors de la compression: " . $e->getMessage());
            return $base64Data; // Retourner l'original en cas d'erreur
        }
    }

    /**
     * Redimensionner une image pour respecter les limites
     */
    private function resizeImage($image, int $width, int $height)
    {
        $maxWidth = self::MAX_DIMENSIONS['width'];
        $maxHeight = self::MAX_DIMENSIONS['height'];

        if ($width > $maxWidth) {
            $height = intval($height * ($maxWidth / $width));
            $width = $maxWidth;
        }

        if ($height > $maxHeight) {
            $width = intval($width * ($maxHeight / $height));
            $height = $maxHeight;
        }

        $resized = imagecreatetruecolor($width, $height);
        if ($resized === false) {
            return $image; // Retourner l'originale si redimensionnement échoue
        }

        imagecopyresampled(
            $resized, $image,
            0, 0, 0, 0,
            $width, $height,
            imagesx($image), imagesy($image)
        );

        return $resized;
    }

    /**
     * Convertir une image en JPEG compressé base64
     */
    private function imageToJpegBase64($image): string
    {
        ob_start();
        imagejpeg($image, null, self::COMPRESSION_QUALITY);
        $output = ob_get_clean();
        return 'data:image/jpeg;base64,' . base64_encode($output);
    }

    /**
     * Convertir une image en PNG compressé base64
     */
    private function imageToPngBase64($image): string
    {
        ob_start();
        imagepng($image, null, 9); // Compression level 9
        $output = ob_get_clean();
        return 'data:image/png;base64,' . base64_encode($output);
    }

    /**
     * Convertir une image en WebP compressé base64
     */
    private function imageToWebpBase64($image): string
    {
        if (!function_exists('imagewebp')) {
            return $this->imageToJpegBase64($image); // Fallback to JPEG
        }

        ob_start();
        imagewebp($image, null, self::COMPRESSION_QUALITY);
        $output = ob_get_clean();
        return 'data:image/webp;base64,' . base64_encode($output);
    }

    /**
     * Accepter une URL ou base64 et valider
     * 
     * @param string|null $fileData
     * @param string $fieldName
     * @return string|null
     */
    public function process(?string $fileData, string $fieldName = 'image'): ?string
    {
        if (!$fileData || empty(trim($fileData))) {
            return null; // Retourner null si vide
        }

        // Si c'est du base64, valider et compresser
        if (strpos($fileData, 'data:') === 0) {
            if (strpos($fileData, ';base64,') === false) {
                return null; // Retourner null si format invalide
            }
            try {
                return $this->validateAndProcessBase64($fileData, $fieldName);
            } catch (\InvalidArgumentException $e) {
                error_log("FileUploader error: " . $e->getMessage());
                return null; // Retourner null en cas d'erreur au lieu de throw
            }
        }

        // Si c'est une URL, valider qu'elle est valide
        if (filter_var($fileData, FILTER_VALIDATE_URL)) {
            return $fileData;
        }

        // Si ce n'est ni base64 ni URL, retourner null
        return null;
    }
}
