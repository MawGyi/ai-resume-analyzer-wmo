import { useRef } from "react";
import { Camera, X, ImagePlus } from "lucide-react";
import { useResumeStore } from "~/stores/useResumeStore";

export default function ProfilePictureUpload() {
    const profilePicture = useResumeStore(
        (s) => s.resumeData.personalInfo.profilePicture
    );
    const setProfilePicture = useResumeStore((s) => s.setProfilePicture);
    const clearProfilePicture = useResumeStore((s) => s.clearProfilePicture);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) return;
        if (file.size > 2 * 1024 * 1024) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            if (dataUrl) {
                setProfilePicture(dataUrl);
            }
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith("image/")) return;
        if (file.size > 2 * 1024 * 1024) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            if (dataUrl) setProfilePicture(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                style={{ display: "none" }}
            />

            {profilePicture ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                    <img
                        src={profilePicture}
                        alt="Profile"
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid var(--accent-blue-dim)",
                            boxShadow: "var(--shadow-elevated)"
                        }}
                    />
                    <button
                        onClick={clearProfilePicture}
                        style={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            width: 24,
                            height: 24,
                            background: "var(--accent-red)",
                            color: "white",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            cursor: "pointer",
                            boxShadow: "var(--shadow-card)"
                        }}
                    >
                        <X style={{ width: 12, height: 12 }} />
                    </button>
                    <button
                        onClick={() => inputRef.current?.click()}
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            background: "rgba(0, 0, 0, 0.5)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            cursor: "pointer",
                            opacity: 0,
                            transition: "opacity 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                    >
                        <Camera style={{ width: 20, height: 20, color: "white" }} />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        border: "2px dashed var(--border-default)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--bg-tertiary)",
                        transition: "all 0.2s ease",
                        cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--accent-blue)";
                        e.currentTarget.style.background = "var(--bg-hover)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-default)";
                        e.currentTarget.style.background = "var(--bg-tertiary)";
                    }}
                >
                    <ImagePlus style={{ width: 20, height: 20, color: "var(--text-muted)" }} />
                </button>
            )}

            <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Profile Photo</p>
                <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
                    JPG, PNG or WebP • Max 2MB
                </p>
            </div>
        </div>
    );
}
