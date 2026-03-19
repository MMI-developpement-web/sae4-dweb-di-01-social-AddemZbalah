import { useEffect, useId, useMemo, useState, type ChangeEvent } from "react";
import ConnexionBtn from "../Connexion-Inscription/Connexion-Inscription_Btn";

interface AddPostsProps {
	onMediaChange?: (file: File | null) => void;
}

export default function AddPosts({ onMediaChange }: AddPostsProps) {
	const inputId = useId();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
		setSelectedFile(file);
		onMediaChange?.(file);
	};

	const handleRemoveMedia = () => {
		setSelectedFile(null);
		onMediaChange?.(null);
	};

	return (
		<section className="w-full" aria-labelledby={`${inputId}-title`}>
			<h2 id={`${inputId}-title`} className="sr-only">
				Ajouter un media au post
			</h2>

			<label
				htmlFor={inputId}
				className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-secondary bg-primary/20 p-8 text-secondary transition-colors duration-300 hover:bg-secondary/10 focus-within:ring-2 focus-within:ring-secondary"
			>
				<span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary p-2">
					<img src="/assets/Container.svg" alt="" className="h-full w-full" aria-hidden="true" />
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
