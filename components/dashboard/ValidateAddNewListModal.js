"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { createClient } from "@/libs/supabase/client";

const STORAGE_BUCKET = "email_list_sourcefile";
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_ROWS = 200000;
const PREVIEW_ROWS = 12;

const isCsvFile = (file) => file?.name?.toLowerCase().endsWith(".csv");

const normalizeEmail = (value) => (value || "").trim().toLowerCase();

const isValidEmail = (value) => {
  const email = normalizeEmail(value);
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const inferDefaultEmailColumnIndex = ({ rows, hasHeader }) => {
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const firstRow = rows[0] || [];
  const columnCount = Math.max(
    0,
    ...rows.map((row) => (Array.isArray(row) ? row.length : 0))
  );

  if (hasHeader) {
    const headerIndex = firstRow.findIndex((cell) =>
      String(cell || "")
        .toLowerCase()
        .includes("email")
    );
    if (headerIndex >= 0) return headerIndex;
  }

  let bestIndex = 0;
  let bestScore = -1;
  for (let col = 0; col < columnCount; col += 1) {
    let hits = 0;
    let total = 0;
    for (const row of dataRows) {
      const value = row?.[col];
      if (value === undefined || value === null || String(value).trim() === "") {
        continue;
      }
      total += 1;
      if (isValidEmail(value)) hits += 1;
    }
    const score = total === 0 ? 0 : hits / total;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = col;
    }
  }

  return bestIndex;
};

const validateEmailColumnFromSample = ({ rows, selectedIndex, hasHeader }) => {
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const nonEmpty = [];
  for (const row of dataRows) {
    const value = row?.[selectedIndex];
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (!text) continue;
    nonEmpty.push(text);
  }

  const total = nonEmpty.length;
  const valid = nonEmpty.filter((v) => isValidEmail(v)).length;

  if (total === 0) {
    return {
      ok: false,
      message: "The selected column is empty and cannot be used as the Email column.",
    };
  }

  const ratio = valid / total;
  const threshold = total < 20 ? 0.8 : 0.6;

  if (valid === 0 || ratio < threshold) {
    return {
      ok: false,
      message: `The selected column does not look like an Email column (valid email ratio in sample: ${(ratio * 100).toFixed(
        0
      )}%). Please select a column that contains email addresses.`,
    };
  }

  return { ok: true };
};

const parsePreview = async ({ file }) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      skipEmptyLines: "greedy",
      preview: PREVIEW_ROWS + 1,
      complete: (results) => {
        if (results?.errors?.length) {
          reject(new Error(results.errors[0]?.message || "Failed to parse CSV."));
          return;
        }
        resolve(results.data || []);
      },
      error: (err) => reject(err),
    });
  });
};

const buildColumnNames = ({ previewRows, hasHeader }) => {
  const firstRow = previewRows[0] || [];
  const columnCount = Math.max(
    0,
    ...previewRows.map((row) => (Array.isArray(row) ? row.length : 0))
  );

  const names = [];
  for (let i = 0; i < columnCount; i += 1) {
    if (hasHeader) {
      const header = String(firstRow?.[i] ?? "").trim();
      names.push(header || `Column ${i + 1}`);
    } else {
      names.push(`Column ${i + 1}`);
    }
  }
  return names;
};

export default function ValidateAddNewListModal() {
  const dialogRef = useRef(null);
  const fileInputRef = useRef(null);
  const supabase = useMemo(() => createClient(), []);
  const previewScrollRef = useRef(null);
  const headerCellRefs = useRef([]);
  const lastScrolledColumnRef = useRef(null);
  const preservedScrollLeftRef = useRef(null);
  const didInitSelectionRef = useRef(false);

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [isParsingPreview, setIsParsingPreview] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);
  const [previewRows, setPreviewRows] = useState([]);
  const [columnNames, setColumnNames] = useState([]);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState({ phase: "", pct: 0 });

  const removeFile = () => {
    setFile(null);
    setPreviewRows([]);
    setColumnNames([]);
    setSelectedColumnIndex(0);
    setStep(1);
    lastScrolledColumnRef.current = null;
    preservedScrollLeftRef.current = null;
    didInitSelectionRef.current = false;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const open = () => {
    setStep(1);
    setFile(null);
    setPreviewRows([]);
    setColumnNames([]);
    setSelectedColumnIndex(0);
    setHasHeader(true);
    setIsSubmitting(false);
    setProgress({ phase: "", pct: 0 });
    lastScrolledColumnRef.current = null;
    preservedScrollLeftRef.current = null;
    didInitSelectionRef.current = false;
    dialogRef.current?.showModal();
  };

  const close = () => {
    dialogRef.current?.close();
  };

  const handleFileSelected = async (nextFile) => {
    if (!nextFile) return;

    if (!isCsvFile(nextFile)) {
      toast.error("Only CSV files (.csv) are supported.");
      return;
    }

    if (nextFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File is too large. The current limit is 50MB.");
      return;
    }

    setFile(nextFile);
  };

  const loadPreview = async ({ nextHasHeader, source, currentSelectedColumnIndex }) => {
    if (!file) return;
    setIsParsingPreview(true);
    try {
      const rows = await parsePreview({ file });
      setPreviewRows(rows);

      const names = buildColumnNames({ previewRows: rows, hasHeader: nextHasHeader });
      setColumnNames(names);

      const columnCount = names.length;
      const shouldInferDefault = source === "initial" || !didInitSelectionRef.current;

      if (shouldInferDefault) {
        const defaultIndex = inferDefaultEmailColumnIndex({
          rows,
          hasHeader: nextHasHeader,
        });
        didInitSelectionRef.current = true;
        setSelectedColumnIndex(defaultIndex);
      } else {
        const clamped = Math.min(
          Math.max(0, currentSelectedColumnIndex ?? 0),
          Math.max(0, columnCount - 1)
        );
        setSelectedColumnIndex(clamped);
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Failed to parse preview.");
    } finally {
      setIsParsingPreview(false);
    }
  };

  const goNext = async () => {
    if (step === 1) {
      if (!file) {
        toast.error("Please choose a CSV file first.");
        return;
      }
      setStep(2);
      await loadPreview({ nextHasHeader: hasHeader, source: "initial" });
    }
  };

  const goBack = () => {
    if (step === 2) setStep(1);
  };

  const previewDataRows = useMemo(() => {
    const rows = previewRows || [];
    const dataRows = hasHeader ? rows.slice(1) : rows;
    return dataRows.slice(0, PREVIEW_ROWS);
  }, [previewRows, hasHeader]);

  useEffect(() => {
    if (step !== 2) return;
    if (isParsingPreview) return;

    const container = previewScrollRef.current;
    if (!container) return;

    if (preservedScrollLeftRef.current !== null) {
      const preservedLeft = preservedScrollLeftRef.current;
      preservedScrollLeftRef.current = null;
      requestAnimationFrame(() => {
        container.scrollLeft = preservedLeft;
      });
      return;
    }

    const cell = headerCellRefs.current?.[selectedColumnIndex];
    if (!cell) return;

    const behavior = lastScrolledColumnRef.current === null ? "auto" : "smooth";
    lastScrolledColumnRef.current = selectedColumnIndex;

    requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();

      const cellCenter =
        cellRect.left - containerRect.left + container.scrollLeft + cellRect.width / 2;
      const targetLeft = Math.max(0, cellCenter - containerRect.width / 2);

      container.scrollTo({ left: targetLeft, behavior });
    });
  }, [step, isParsingPreview, selectedColumnIndex, columnNames.length]);

  const submit = async () => {
    if (!file) return;

    if (!previewRows?.length) {
      toast.error("Please load the preview first.");
      return;
    }

    const sampleValidation = validateEmailColumnFromSample({
      rows: previewRows,
      selectedIndex: selectedColumnIndex,
      hasHeader,
    });
    if (!sampleValidation.ok) {
      toast.error(sampleValidation.message);
      return;
    }

    setIsSubmitting(true);
    setProgress({ phase: "Preparing", pct: 0 });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in before uploading.");
        return;
      }

      const jobId = crypto.randomUUID();
      const objectPath = `${user.id}/${jobId}/${file.name}`;

      setProgress({ phase: "Uploading file", pct: 5 });
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(objectPath, file, {
          upsert: false,
          contentType: "text/csv",
        });

      if (uploadError) {
        throw uploadError;
      }

      setProgress({ phase: "Creating job", pct: 10 });
      const createRes = await fetch("/api/validate/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          name: file.name,
          sourceFilename: file.name,
          sourceStoragePath: objectPath,
        }),
      });

      if (!createRes.ok) {
        const body = await createRes.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to create job.");
      }

      setProgress({ phase: "Parsing and importing", pct: 12 });

      const uniqueEmails = new Set();
      let totalNonEmpty = 0;
      let validCount = 0;
      let rowIndex = 0;
      let batch = [];
      let batchInFlight = Promise.resolve();

      const flushBatch = async () => {
        const toSend = batch;
        batch = [];
        if (!toSend.length) return;
        await fetch("/api/validate/email-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, emails: toSend }),
        }).then(async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body?.error || "Failed to write email tasks.");
          }
        });
      };

      await new Promise((resolve, reject) => {
        Papa.parse(file, {
          skipEmptyLines: "greedy",
          chunkSize: 1024 * 1024,
          chunk: (results, parser) => {
            try {
              const rows = results?.data || [];

              for (const row of rows) {
                rowIndex += 1;

                if (rowIndex > MAX_ROWS) {
                  parser.abort();
                  reject(
                    new Error(
                      `Row limit exceeded (max ${MAX_ROWS.toLocaleString()} rows).`
                    )
                  );
                  return;
                }

                if (hasHeader && rowIndex === 1) {
                  continue;
                }

                const raw = row?.[selectedColumnIndex];
                if (raw === undefined || raw === null) continue;
                const text = String(raw).trim();
                if (!text) continue;

                totalNonEmpty += 1;
                if (!isValidEmail(text)) {
                  continue;
                }

                const email = normalizeEmail(text);
                if (uniqueEmails.has(email)) continue;

                uniqueEmails.add(email);
                validCount += 1;
                batch.push(email);

                if (batch.length >= 1000) {
                  const currentBatch = batch;
                  batch = [];
                  batchInFlight = batchInFlight.then(() =>
                    fetch("/api/validate/email-tasks", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ jobId, emails: currentBatch }),
                    }).then(async (res) => {
                      if (!res.ok) {
                        const body = await res.json().catch(() => ({}));
                        throw new Error(body?.error || "Failed to write email tasks.");
                      }
                    })
                  );
                }
              }

              const cursor = results?.meta?.cursor;
              if (typeof cursor === "number" && file.size > 0) {
                const pct = Math.min(95, Math.max(12, Math.round((cursor / file.size) * 80) + 12));
                setProgress({ phase: "Parsing and importing", pct });
              }
            } catch (e) {
              parser.abort();
              reject(e);
            }
          },
          complete: async () => {
            try {
              await batchInFlight;
              await flushBatch();

              if (validCount === 0) {
                reject(
                  new Error(
                    "No valid email addresses were found. Please select the correct Email column."
                  )
                );
                return;
              }

              const ratio = totalNonEmpty === 0 ? 0 : validCount / totalNonEmpty;
              const threshold = totalNonEmpty < 20 ? 0.8 : 0.6;
              if (ratio < threshold) {
                reject(
                  new Error(
                    `The selected column does not look like an Email column (valid email ratio: ${(ratio * 100).toFixed(
                      0
                    )}%). Please select a column that contains email addresses.`
                  )
                );
                return;
              }

              setProgress({ phase: "Finalizing", pct: 97 });
              const updateRes = await fetch(`/api/validate/jobs/${jobId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uniqueEmails: uniqueEmails.size }),
              });

              if (!updateRes.ok) {
                const body = await updateRes.json().catch(() => ({}));
                throw new Error(body?.error || "Failed to finalize job.");
              }

              resolve();
            } catch (e) {
              reject(e);
            }
          },
          error: (err) => reject(err),
        });
      });

      setProgress({ phase: "Done", pct: 100 });
      toast.success("Job created and emails imported.");
      close();
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Submit failed.");
    } finally {
      setIsSubmitting(false);
      setProgress({ phase: "", pct: 0 });
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={open}>
        Add New List
      </button>

      <dialog className="modal" ref={dialogRef}>
        <div className="modal-box w-11/12 max-w-5xl">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={close}
            aria-label="Close"
          >
            ✕
          </button>

          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Add New List</h3>
              <div className="text-sm text-base-content/60">
                CSV only. Max 50MB. Max {MAX_ROWS.toLocaleString()} rows.
              </div>
            </div>

            <ul className="steps w-full">
              <li className={`step ${step >= 1 ? "step-primary" : ""}`}>
                Upload list
              </li>
              <li className={`step ${step >= 2 ? "step-primary" : ""}`}>
                Select column
              </li>
            </ul>

            {step === 1 ? (
              <div className="space-y-4">
                <div
                  className="border border-dashed border-base-300 rounded-box p-10 text-center bg-base-200 cursor-pointer select-none"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dropped = e.dataTransfer.files?.[0];
                    handleFileSelected(dropped);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-base-100 border border-base-300 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-7 h-7 text-base-content/70"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <path d="M7 10l5-5 5 5" />
                          <path d="M12 5v14" />
                        </svg>
                      </div>
                    </div>
                    <div className="font-medium">Drag and drop your list here</div>
                    <div className="text-sm text-base-content/60">
                      Or click anywhere here to choose a CSV file
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      className="hidden"
                      onChange={(e) => handleFileSelected(e.target.files?.[0])}
                    />
                  </div>
                </div>

                {file ? (
                  <div className="alert flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-sm text-base-content/60 shrink-0">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFile();
                      }}
                      aria-label="Remove file"
                      title="Remove"
                      disabled={isSubmitting}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-base-content/70">
                    Select the column that contains email addresses (one column only)
                  </div>
                  <label className="flex items-center gap-3 select-none">
                    <span className="text-sm text-base-content/70">
                      Does first row contain labels?
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-sm toggle-primary"
                      checked={hasHeader}
                      onChange={(e) => {
                        const nextHasHeader = e.target.checked;
                        setHasHeader(nextHasHeader);
                        preservedScrollLeftRef.current =
                          previewScrollRef.current?.scrollLeft ?? 0;
                        loadPreview({
                          nextHasHeader,
                          source: "toggle",
                          currentSelectedColumnIndex: selectedColumnIndex,
                        });
                      }}
                      disabled={isParsingPreview || isSubmitting}
                    />
                    <span className="text-sm font-medium min-w-8 text-right">
                      {hasHeader ? "Yes" : "No"}
                    </span>
                  </label>
                </div>

                <div className="border border-base-300 rounded-xl overflow-hidden">
                  <div
                    ref={previewScrollRef}
                    className="overflow-auto h-[420px]"
                  >
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          {columnNames.map((name, idx) => (
                            <th
                              key={`${name}-${idx}`}
                              ref={(el) => {
                                headerCellRefs.current[idx] = el;
                              }}
                            >
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="emailColumn"
                                  className="radio radio-xs"
                                  checked={selectedColumnIndex === idx}
                                  onChange={() => setSelectedColumnIndex(idx)}
                                  disabled={isParsingPreview || isSubmitting}
                                />
                                <span className="truncate max-w-[180px]">
                                  {name || `Column ${idx + 1}`}
                                </span>
                              </label>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {isParsingPreview ? (
                        <tr>
                          <td colSpan={Math.max(1, columnNames.length)}>
                            <div className="flex items-center gap-2 py-6">
                              <span className="loading loading-spinner loading-sm" />
                              <span className="text-sm text-base-content/70">
                                Parsing preview…
                              </span>
                            </div>
                          </td>
                        </tr>
                        ) : (
                          previewDataRows.map((row, rIdx) => (
                            <tr key={`r-${rIdx}`}>
                              {columnNames.map((_, cIdx) => (
                                <td
                                  key={`c-${rIdx}-${cIdx}`}
                                  className={`whitespace-nowrap ${
                                    cIdx === selectedColumnIndex
                                      ? "bg-warning/10"
                                      : ""
                                  }`}
                                >
                                  {row?.[cIdx] ?? ""}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {isSubmitting ? (
                  <div className="space-y-2">
                    <div className="text-sm text-base-content/70">
                      {progress.phase}（{progress.pct}%）
                    </div>
                    <progress
                      className="progress progress-primary w-full"
                      value={progress.pct}
                      max="100"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <button
                className="btn btn-ghost"
                onClick={goBack}
                disabled={step === 1 || isSubmitting}
              >
                Back
              </button>

              {step === 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={goNext}
                  disabled={!file || isSubmitting}
                >
                  Next
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={submit}
                  disabled={isSubmitting || isParsingPreview}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Create"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close modal backdrop">close</button>
        </form>
      </dialog>
    </>
  );
}
