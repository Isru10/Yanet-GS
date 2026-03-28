"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, File, Send, Loader2, FileText, Trash2, CheckCircle2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

// Real schema: files table has uploader_id, patient_id, doctor_id, file_name, file_url, created_at
// No: file_type, sent_to_doctor, uploaded_at
// "shared with doctor" = doctor_id IS NOT NULL

interface PatientFile {
  id: string;
  file_name: string;
  file_url: string;
  doctor_id: string | null;
  created_at: string;
}

export default function FilesPage() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PatientFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [myDoctorId, setMyDoctorId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setUserEmail(user.email ?? "");

      // Get files where patient_id = me
      const { data: fileRows } = await supabase
        .from("files").select("id,file_name,file_url,doctor_id,created_at")
        .eq("patient_id", user.id).order("created_at", { ascending: false });
      setFiles((fileRows ?? []) as PatientFile[]);

      // Get most recent doctor from bookings (to enable "send to doctor")
      const { data: bk } = await supabase
        .from("bookings").select("doctor_id")
        .eq("patient_email", user.email).order("created_at", { ascending: false }).limit(1).single();
      setMyDoctorId(bk?.doctor_id ?? null);

      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large. Max 10 MB."); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage.from("medical_files").upload(path, file);
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from("medical_files").getPublicUrl(path);

      const { data: row, error: dbErr } = await supabase.from("files").insert({
        uploader_id: userId,
        patient_id: userId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        doctor_id: null,
      }).select().single();
      if (dbErr) throw dbErr;

      setFiles((prev) => [row as PatientFile, ...prev]);
      toast.success("File uploaded!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function sendToDoctor(fileId: string) {
    if (!myDoctorId) { toast.error("No doctor found. Book an appointment first."); return; }
    const { error } = await supabase.from("files").update({ doctor_id: myDoctorId }).eq("id", fileId);
    if (error) { toast.error("Failed to send."); return; }
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, doctor_id: myDoctorId } : f));
    toast.success("File shared with your doctor!");
  }

  async function deleteFile(f: PatientFile) {
    const parts = f.file_url.split("/medical_files/");
    if (parts[1]) await supabase.storage.from("medical_files").remove([parts[1]]);
    await supabase.from("files").delete().eq("id", f.id);
    setFiles((prev) => prev.filter((x) => x.id !== f.id));
    toast.success("File deleted.");
  }

  const isImage = (name: string) => /\.(png|jpg|jpeg|gif|webp)$/i.test(name);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Files</h1>
          <p className="text-gray-500 text-sm mt-1">Upload and share medical documents with your doctor.</p>
        </div>
        <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="brand-gradient-light text-white font-semibold shrink-0">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
          Upload File
        </Button>
        <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleUpload} />
      </div>

      <button onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-2xl p-8 flex flex-col items-center gap-2 hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
        <Upload className="w-8 h-8 text-emerald-400" />
        <p className="text-sm font-medium text-emerald-700">Click to upload or drag & drop</p>
        <p className="text-xs text-gray-400">Images, PDF, Word — max 10 MB</p>
      </button>

      {!myDoctorId && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-xs">
          ⚠ Book an appointment first to enable &quot;Send to Doctor&quot; feature.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-emerald-600" /></div>
      ) : files.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <File className="w-10 h-10 mx-auto mb-2 text-gray-200" />
          <p className="text-sm">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file, i) => (
            <motion.div key={file.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                {isImage(file.file_name) ? <ImageIcon className="w-5 h-5 text-emerald-600" /> : <FileText className="w-5 h-5 text-emerald-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{file.file_name}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {new Date(file.created_at).toLocaleDateString("en-ET", { dateStyle: "medium" })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {file.doctor_id ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Shared
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => sendToDoctor(file.id)}
                    className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <Send className="w-3.5 h-3.5 mr-1" /> Send to Doctor
                  </Button>
                )}
                <a href={file.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-gray-400 hover:text-emerald-600 transition-colors p-1">
                  <FileText className="w-4 h-4" />
                </a>
                <button onClick={() => deleteFile(file)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
