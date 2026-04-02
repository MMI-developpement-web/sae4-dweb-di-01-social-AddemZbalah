import { useEffect, useId, useMemo, useState, type ChangeEvent } from "react";
import ConnexionBtn from "../Button/Connexion-Inscription_Btn";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB for videos
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

interface AddPostsProps {
	onMediaChange?: (file: File | null) => void;
}

export default function AddPosts({ onMediaChange }: AddPostsProps) {
	const inputId = useId();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [errorMessage, setErrorMessage] = useState<string>("");

	const previewUrl = useMemo(() => {
		if (!selectedFile) {
			return "";
		}
		return URL.createObjectURL(selectedFile);
	}, [selectedFile]);

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const isVideo = selectedFile?.type.startsWith("video/") ?? false;

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null;
		setErrorMessage("");

		if (file) {
			const isVideoFile = file.type.startsWith("video/");
			const maxSize = isVideoFile ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
			const allowedTypes = isVideoFile ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;

			// Validate file type
			if (!allowedTypes.includes(file.type)) {
				const fileTypeLabel = isVideoFile ? "vidéo" : "image";
				setErrorMessage(
					`Format de fichier non supporté. Formats acceptés: ${fileTypeLabel === "image" ? "JPEG, PNG, GIF, WebP" : "MP4, WebM, OGG, MOV"}`
				);
				setSelectedFile(null);
				onMediaChange?.(null);
				return;
			}

			// Validate file size
			if (file.size > maxSize) {
				const maxSizeMB = Math.round(maxSize / (1024 * 1024));
				const fileSizeMB = Math.round(file.size / (1024 * 1024));
				const fileTypeLabel = isVideoFile ? "vidéo" : "image";
				setErrorMessage(
					`${fileTypeLabel.charAt(0).toUpperCase()}${fileTypeLabel.slice(1)} trop volumineuse (${fileSizeMB}MB). Taille maximale: ${maxSizeMB}MB`
				);
				setSelectedFile(null);
				onMediaChange?.(null);
				return;
			}
		}

		setSelectedFile(file);
		onMediaChange?.(file);
	};

	const handleRemoveMedia = () => {
		setSelectedFile(null);
		setErrorMessage("");
		onMediaChange?.(null);
	};

	return (
		<section className="w-full" aria-labelledby={`${inputId}-title`}>
			<h2 id={`${inputId}-title`} className="sr-only">
				Ajouter un media au post
			</h2>

			{errorMessage && (
				<aside className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
					{errorMessage}
				</aside>
			)}

			<label
				htmlFor={inputId}
				className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-secondary bg-primary/20 p-8 text-secondary transition-colors duration-300 hover:bg-secondary/10 focus-within:ring-2 focus-within:ring-secondary"
			>
				<span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary p-2">
					<img src={`${import.meta.env.BASE_URL}/assets/Container.svg`} alt="" className="h-full w-full" aria-hidden="true" />
				</span>
				<span className="text-lg font-semibold">Photo ou video</span>
				<input
					id={inputId}
					type="file"
					accept="image/*,video/*"
					className="sr-only"
					onChange={handleFileChange}
				/>
			</label>

			{selectedFile && (
				<figure className="mt-4 space-y-3">
					{isVideo ? (
						<video
							className="w-full rounded-xl border border-secondary/40"
							controls
							src={previewUrl}
						/>
					) : (
						<img
							className="w-full rounded-xl border border-secondary/40 object-cover"
							src={previewUrl}
							alt={`Apercu de ${selectedFile.name}`}
						/>
					)}
					<figcaption className="text-sm font-medium text-secondary">
						{selectedFile.name}
					</figcaption>
					<ConnexionBtn
						type="button"
						size="sm"
						variant="primary"
						onClick={handleRemoveMedia}
					>
						Retirer le media
					</ConnexionBtn>
				</figure>
			)}
		</section>
	);
}

export { AddPosts };
