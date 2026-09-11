import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Phone,
  UserCircle2,
  FileWarning,
  FileText,
  ShieldAlert,
  Droplets,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const emptyData = {
  user: { name: "", lastname: "", bloodGroup: null, umid: "" },
  medical: { allergies: [], emergencyContact: "", emergencyContactPhone: "" },
  reports: [],
};

const EmergencyFolderPublic = () => {
  const { umid } = useParams();
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!umid?.trim()) {
      setError("Invalid Medicare ID");
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/emergency/${umid.trim()}`);
        if (cancelled) return;
        if (response.data?.success && response.data?.data) {
          setData(response.data.data);
        } else {
          setError("Could not load Emergency Folder");
        }
      } catch (err) {
        if (cancelled) return;
        const msg =
          err.response?.data?.message ||
          err.response?.status === 404
            ? "No Emergency Folder found for this Medicare ID"
            : "Failed to load Emergency Folder";
        setError(msg);
        setData(emptyData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [umid]);

  const patientDisplayName = [data.user.name, data.user.lastname]
    .filter(Boolean)
    .join(" ")
    .trim();
  const bloodGroup = data.user.bloodGroup?.trim() || null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          <p className="mt-4 text-slate-600">Loading Emergency Folder…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-center text-xl font-bold text-slate-900">
            Emergency Folder not found
          </h1>
          <p className="mt-2 text-center text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-10 sm:pb-14">
      <div className="mx-auto w-full max-w-lg px-4 pt-4 sm:max-w-2xl sm:px-5 sm:pt-6 md:max-w-3xl md:px-6 md:pt-8 lg:max-w-5xl lg:px-8 xl:max-w-6xl 2xl:max-w-7xl">
        <header className="mb-3 sm:mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-600 sm:text-xs">
            Emergency Folder
          </p>
          <h1 className="mt-0.5 text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
            Critical info for responders
          </h1>
          {patientDisplayName && (
            <p className="mt-1 text-base font-semibold text-slate-800 sm:text-lg">
              {patientDisplayName}
            </p>
          )}
          <p className="mt-1 text-sm leading-relaxed text-slate-600 sm:text-base">
            Shared by patient for emergency use only.
          </p>
        </header>

        <div
          className="mb-3 overflow-hidden rounded-2xl border border-red-200/90 bg-white shadow-sm ring-1 ring-red-100/80 sm:mb-3"
          role="status"
        >
          <div className="flex gap-3 p-4 sm:gap-4 sm:p-5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/25 sm:h-12 sm:w-12"
              aria-hidden
            >
              <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                Emergency-only disclosure
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm sm:leading-relaxed">
                This page shows only what the patient chose to share in emergencies:
                blood type, allergies, emergency contact, and selected reports.
              </p>
            </div>
          </div>
        </div>

        {data.user.umid && (
          <div className="mb-2 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-200/50 sm:mb-2 sm:p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Medicare ID (UMID)
            </p>
            <p className="mt-1 break-all font-mono text-lg font-bold tracking-wide text-slate-900 sm:text-xl">
              {data.user.umid}
            </p>
          </div>
        )}

        <section aria-labelledby="summary-heading" className="mb-4 sm:mb-5">
          <h2
            id="summary-heading"
            className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <AlertCircle className="h-4 w-4" aria-hidden />
            </span>
            Emergency summary
          </h2>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
            <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-200/40 sm:p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <Droplets className="h-3.5 w-3.5 shrink-0 text-red-500" aria-hidden />
                Blood group
              </div>
              <div className="mt-3 flex flex-1 flex-col justify-center">
                {bloodGroup ? (
                  <span className="inline-flex min-h-[52px] w-fit min-w-[4.5rem] items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-2xl font-bold text-white shadow-md shadow-red-600/30 sm:min-h-[56px] sm:text-3xl">
                    {bloodGroup}
                  </span>
                ) : (
                  <p className="text-base font-medium text-slate-400 sm:text-lg">
                    Not set
                  </p>
                )}
              </div>
            </div>

            <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-200/40 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Allergies
              </p>
              <div className="mt-3 flex-1">
                {(data.medical.allergies || []).length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {data.medical.allergies.map((a) => (
                      <li
                        key={a}
                        className="rounded-full border border-amber-200/90 bg-amber-50 px-3.5 py-2 text-sm font-semibold text-amber-950 sm:px-4 sm:text-base"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base font-medium text-slate-400 sm:text-lg">
                    None listed
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-200/40 sm:col-span-2 sm:p-5 lg:p-6">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <UserCircle2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                Emergency contact
              </div>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start sm:gap-6 lg:gap-8">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Name
                  </p>
                  <p className="mt-1 text-lg font-bold leading-snug text-slate-900 sm:text-xl">
                    {data.medical.emergencyContact?.trim() || "—"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Phone
                  </p>
                  <a
                    href={
                      data.medical.emergencyContactPhone
                        ? `tel:${data.medical.emergencyContactPhone.replace(/\s/g, "")}`
                        : undefined
                    }
                    className={`mt-1 inline-flex min-h-11 w-full max-w-full items-center gap-2 rounded-xl border border-transparent px-0 text-lg font-bold transition sm:text-xl ${
                      data.medical.emergencyContactPhone
                        ? "text-red-600 active:text-red-700"
                        : "pointer-events-none text-slate-400"
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                      <Phone className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 break-all">
                      {data.medical.emergencyContactPhone?.trim() || "No number"}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="reports-heading" className="w-full">
          <div className="mb-4 sm:mb-5">
            <h2
              id="reports-heading"
              className="flex items-center gap-3 text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/20 ring-2 ring-red-500/20">
                <FileWarning className="h-[18px] w-[18px]" aria-hidden />
              </span>
              Emergency reports
            </h2>
            <p className="mt-1.5 pl-[3.25rem] text-sm text-slate-500">
              {data.reports.length === 0
                ? "No reports shared in this folder."
                : `${data.reports.length} ${
                    data.reports.length === 1 ? "document" : "documents"
                  } available.`}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.04)]">
            {data.reports.length === 0 ? (
              <div className="px-4 py-12 text-center sm:px-8 sm:py-16">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <FileText className="h-7 w-7" aria-hidden />
                </div>
                <p className="text-base font-semibold text-slate-800 sm:text-lg">
                  No reports in this folder
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
                  The patient has not added any reports to their Emergency Folder.
                </p>
              </div>
            ) : (
              <>
                <div
                  className="hidden border-b border-slate-200 bg-gradient-to-b from-slate-100 to-slate-50/95 py-3.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:grid md:items-center md:px-5 lg:px-6"
                  style={{
                    gridTemplateColumns: "minmax(0, 1fr) 5.5rem 7rem minmax(6rem, 1fr)",
                  }}
                >
                  <span className="min-w-0 px-1">Document</span>
                  <span className="flex justify-center">Type</span>
                  <span className="flex justify-center tabular-nums">Added</span>
                  <span className="flex justify-center">Open</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {data.reports.map((r, idx) => {
                    const dateStr = r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—";
                    const category = r.category || "medical";
                    return (
                      <li key={r._id}>
                        <div
                          className={`flex flex-col gap-4 px-4 py-4 transition-colors sm:px-5 sm:py-5 md:grid md:items-center md:gap-0 md:py-4 md:px-5 lg:px-6 ${
                            idx % 2 === 1
                              ? "bg-slate-50/35 hover:bg-slate-100/50"
                              : "hover:bg-slate-50/80"
                          }`}
                          style={{
                            gridTemplateColumns:
                              "minmax(0, 1fr) 5.5rem 7rem minmax(6rem, 1fr)",
                          }}
                        >
                          <div className="flex min-w-0 items-start gap-3 sm:gap-4 md:min-w-0 md:pr-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-100 text-red-600 shadow-sm sm:h-12 sm:w-12">
                              <FileText
                                className="h-5 w-5 sm:h-6 sm:w-6"
                                strokeWidth={1.75}
                              />
                            </div>
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <h3 className="break-words text-[15px] font-semibold leading-snug text-slate-900 sm:text-base lg:text-[17px]">
                                {r.originalFilename || "Untitled report"}
                              </h3>
                              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 md:hidden">
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
                                  {category}
                                </span>
                                <span className="tabular-nums text-slate-400">
                                  {dateStr}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="hidden md:flex md:justify-center md:px-2">
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                              {category}
                            </span>
                          </div>
                          <div className="hidden md:flex md:justify-center text-sm font-medium tabular-nums text-slate-600">
                            {dateStr}
                          </div>
                          <div className="flex w-full md:w-auto md:justify-center md:gap-2">
                            {r.fileUrl ? (
                              <a
                                href={r.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 text-sm font-semibold text-white shadow-md shadow-red-600/25 transition hover:bg-red-700 active:bg-red-800 sm:px-4 md:h-10 md:min-w-0 md:flex-initial"
                              >
                                Open
                                <ExternalLink className="h-4 w-4 shrink-0 opacity-90" />
                              </a>
                            ) : (
                              <span className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-500 sm:px-4 md:h-10">
                                Unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmergencyFolderPublic;
