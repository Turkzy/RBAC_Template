import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Upload,
  Loader2,
  Lock,
  Search,
} from "lucide-react";
import dashboard from "../assets/dashboard.png";
import api, { endpoints } from "../config/api.js";
import SweetAlert from "../components/SweetAlert.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ComplianceStatus = () => {
  const [titles, setTitles] = useState([]);
  const [complianceItems, setComplianceItems] = useState([]);
  const [expandedTitleIds, setExpandedTitleIds] = useState([]);
  const [expandedNodeIds, setExpandedNodeIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadingNodeKey, setUploadingNodeKey] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(
    String(new Date().getFullYear()),
  );
  const [search, setSearch] = useState("");
  const fileInputRef = React.useRef(null);
  const { user } = useAuth();

  const getNodeKey = (type, id) => `${type}-${id}`;

  const toggleNodeExpansion = (type, id) => {
    const key = getNodeKey(type, id);
    setExpandedNodeIds((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  const isNodeExpanded = (type, id) =>
    expandedNodeIds.includes(getNodeKey(type, id));

  const isTitleExpanded = (titleId) => expandedTitleIds.includes(titleId);

  const toggleTitleExpansion = (titleId) => {
    setExpandedTitleIds((current) =>
      current.includes(titleId)
        ? current.filter((id) => id !== titleId)
        : [...current, titleId],
    );
  };

  const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_UPLOAD_EXTENSIONS = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".csv",
  ];
  const ACCEPT_UPLOAD_TYPES = ALLOWED_UPLOAD_EXTENSIONS.join(",");

  const hasAllowedUploadExtension = (filename) => {
    const lowerName = String(filename || "").toLowerCase();
    return ALLOWED_UPLOAD_EXTENSIONS.some((extension) =>
      lowerName.endsWith(extension),
    );
  };

  const normalizeStatus = (status) => {
    const value = String(status || "Pending")
      .trim()
      .toLowerCase();
    if (value === "completed" || value === "compliant") {
      return {
        code: "C",
        label: "Compliant",
        classes: "bg-emerald-600 text-white",
      };
    }
    if (value === "in progress" || value === "under evaluation") {
      return {
        code: "UE",
        label: "Under Evaluation",
        classes: "bg-sky-700 text-white",
      };
    }
    if (value === "non-compliant" || value === "non compliant") {
      return {
        code: "NC",
        label: "Non-Compliant",
        classes: "bg-amber-400 text-white",
      };
    }
    if (value === "not applicable") {
      return {
        code: "NA",
        label: "Not Applicable",
        classes: "bg-slate-500 text-white",
      };
    }
    return {
      code: "NS",
      label: "No Submission",
      classes: "bg-slate-300 text-slate-700",
    };
  };

  const normalizeSearchText = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const matchesStatusFilter = (item) => {
    if (statusFilter === "all") return true;
    return normalizeStatus(item.status).label === statusFilter;
  };

  const matchesYearFilter = (item) => {
    const itemYears = [item?.startDate, item?.endDate]
      .map((value) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return null;
        }
        return date.getFullYear();
      })
      .filter((value) => value !== null);

    return itemYears.includes(Number(yearFilter));
  };

  const matchesSearchFilter = (item, nodeLabel) => {
    const query = normalizeSearchText(search);
    if (!query) return true;

    const haystack = [
      nodeLabel,
      item?.submittedBy,
      item?.assignedToUserId,
      item?.assignedToUserIds,
      item?.complianceType,
      item?.originalFilenames,
      item?.fileUrls,
      item?.status,
      item?.submissionStatus,
    ]
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  };

  const normalizeRelativeCompliancePath = (item, formLabel) => {
    const rawValue = String(item?.complianceType || "").trim();
    if (!rawValue || rawValue === formLabel) {
      return "";
    }

    const fullPrefix = `${formLabel} / `;
    return rawValue.startsWith(fullPrefix)
      ? rawValue.slice(fullPrefix.length)
      : rawValue;
  };

  const collectExpandedKeys = (titleData) => {
    const titleIds = [];
    const nodeKeys = [];

    const walkSubForms = (nodes) => {
      (nodes || []).forEach((node) => {
        nodeKeys.push(getNodeKey("subform", node.id));
        walkSubForms(node.ComplianceSubForms);
      });
    };

    (titleData || []).forEach((title) => {
      titleIds.push(title.id);
      (title.ComplianceForms || []).forEach((form) => {
        nodeKeys.push(getNodeKey("form", form.id));
        walkSubForms(form.ComplianceSubForms);
      });
    });

    return { titleIds, nodeKeys };
  };

  const fetchStatusData = async () => {
    try {
      setLoading(true);

      const [titlesResponse, complianceResponse] = await Promise.all([
        api.get(endpoints.complianceForms.titles.getAll),
        api.get(endpoints.compliance.list, { params: { includeDeleted: true } }),
      ]);

      if (titlesResponse.data.error) {
        throw new Error(
          titlesResponse.data.message || "Failed to fetch titles",
        );
      }
      if (complianceResponse.data?.error) {
        throw new Error(
          complianceResponse.data.message ||
            "Failed to fetch compliance status",
        );
      }

      const titleData = titlesResponse.data.data || [];
      const items = complianceResponse.data.items || [];

      setTitles(titleData);
      setComplianceItems(items);
      setExpandedTitleIds([]);
      setExpandedNodeIds([]);
    } catch (error) {
      SweetAlert.toast.error(
        error.message || "Failed to load compliance status",
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusData();
  }, []);

  const statusItemsByNode = React.useMemo(() => {
    const itemMap = new Map();

    const addItem = (titleId, formId, relativePath, item) => {
      const key = `${titleId}:${formId}:${relativePath}`;
      if (!itemMap.has(key)) {
        itemMap.set(key, []);
      }
      itemMap.get(key).push(item);
    };

    complianceItems.forEach((item) => {
      const titleId = item.complianceTitleId;
      const formId = item.complianceFormId;
      if (!titleId || !formId) return;

      const title = titles.find(
        (entry) => String(entry.id) === String(titleId),
      );
      const form = Array.isArray(title?.ComplianceForms)
        ? title.ComplianceForms.find(
            (entry) => String(entry.id) === String(formId),
          )
        : null;
      if (!form) return;

      const relativePath = normalizeRelativeCompliancePath(item, form.formName);
      addItem(titleId, formId, relativePath, item);
    });

    return itemMap;
  }, [complianceItems, titles]);

  const availableYears = React.useMemo(() => {
    const years = new Set();
    const currentYear = String(new Date().getFullYear());

    years.add(currentYear);

    complianceItems.forEach((item) => {
      [item?.startDate, item?.endDate].forEach((value) => {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          years.add(String(date.getFullYear()));
        }
      });
    });

    return [...years].sort((a, b) => Number(b) - Number(a));
  }, [complianceItems]);

  const buildStatusTree = React.useMemo(() => {
    const buildSubNodes = (titleId, formId, nodes, parentPath = "") => {
      return (nodes || [])
        .map((node) => {
          const currentPath = parentPath
            ? `${parentPath} / ${node.formName}`
            : node.formName;
          const children = buildSubNodes(
            titleId,
            formId,
            node.ComplianceSubForms,
            currentPath,
          );
          const statusItems = (
            statusItemsByNode.get(`${titleId}:${formId}:${currentPath}`) || []
          ).filter(
            (item) =>
              matchesStatusFilter(item) &&
              matchesYearFilter(item) &&
              matchesSearchFilter(item, currentPath),
          );

          if (!statusItems.length && !children.length) {
            return null;
          }

          return {
            ...node,
            statusItems,
            children,
          };
        })
        .filter(Boolean);
    };

    return (titles || [])
      .map((title) => {
        const forms = (title.ComplianceForms || [])
          .map((form) => {
            const children = buildSubNodes(
              title.id,
              form.id,
              form.ComplianceSubForms,
            );
            const statusItems = (
              statusItemsByNode.get(`${title.id}:${form.id}:`) || []
            ).filter(
              (item) =>
                matchesStatusFilter(item) &&
                matchesYearFilter(item) &&
                matchesSearchFilter(item, form.formName),
            );

            if (!statusItems.length && !children.length) {
              return null;
            }

            return {
              ...form,
              statusItems,
              children,
            };
          })
          .filter(Boolean);

        if (!forms.length) {
          return null;
        }

        return {
          ...title,
          ComplianceForms: forms,
        };
      })
      .filter(Boolean);
  }, [search, statusFilter, yearFilter, statusItemsByNode, titles]);

  const leftColumnTitles = buildStatusTree.filter(
    (_, index) => index % 2 === 0,
  );
  const rightColumnTitles = buildStatusTree.filter(
    (_, index) => index % 2 === 1,
  );

  const renderStatusBadges = (items) => {
    if (!items.length) return null;

    return (
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-2">
        {items.map((item) => {
          const status = normalizeStatus(item.status);
          return (
            <div
              key={`status-${item.id}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold sm:h-12 sm:w-12 sm:text-sm ${status.classes}`}
              title={status.label}
            >
              {status.code}
            </div>
          );
        })}
      </div>
    );
  };

  const isItemForCurrentUser = (item) => {
    const currentUserId = Number(user?.id || 0);
    if (!currentUserId) return false;

    const matchArray = (values) =>
      Array.isArray(values) &&
      values.some((id) => Number(id) === currentUserId);
    return (
      Number(item?.assignedToUserId) === currentUserId ||
      Number(item?.createdBy) === currentUserId ||
      Number(item?.submittedBy) === currentUserId ||
      matchArray(item?.assignedToUserIds)
    );
  };

  const getPreferredUploadItem = (items) => {
    if (!Array.isArray(items) || !items.length) return null;
    const ownItem = items.find((item) => isItemForCurrentUser(item));
    if (ownItem) return ownItem;
    return items[0];
  };

  const startLeafUpload = (items, nodeKey, nodeLabel) => {
    const targetItem = getPreferredUploadItem(items);
    if (!targetItem?.id) {
      SweetAlert.toast.warning(
        "No compliance item available for submission on this node.",
      );
      return;
    }

    if (targetItem?.isSubmissionClosed) {
      SweetAlert.toast.warning(
        "Submission is closed for this compliance node.",
      );
      return;
    }

    setUploadTarget({ itemId: targetItem.id, nodeKey, nodeLabel });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!uploadTarget || !files.length) return;

    const invalidFile = files.find(
      (file) => !hasAllowedUploadExtension(file.name),
    );
    if (invalidFile) {
      SweetAlert.toast.error(
        `Invalid file type: ${invalidFile.name}. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV.`,
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > MAX_UPLOAD_FILE_SIZE,
    );
    if (oversizedFile) {
      SweetAlert.toast.error(
        `File too large: ${oversizedFile.name}. Maximum allowed size is 5MB.`,
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setUploadingNodeKey(uploadTarget.nodeKey);
      const payload = new FormData();
      files.forEach((file) => payload.append("files", file));

      const { data } = await api.put(
        endpoints.compliance.update(uploadTarget.itemId),
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (data?.error) {
        SweetAlert.toast.error(data.message || "Failed to submit files.");
        return;
      }

      SweetAlert.toast.success(
        `Submission uploaded for ${uploadTarget.nodeLabel}.`,
      );
      await fetchStatusData();
    } catch (error) {
      console.error("Leaf submission upload failed:", error);
      SweetAlert.toast.error(
        "Unable to upload files for this compliance node.",
      );
    } finally {
      setUploadingNodeKey("");
      setUploadTarget(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const renderLeafSubmissionAction = (items, nodeKey, nodeLabel) => {
    if (!Array.isArray(items) || !items.length) return null;
    const targetItem = getPreferredUploadItem(items);
    const isClosed = Boolean(targetItem?.isSubmissionClosed);
    const isUploading = uploadingNodeKey === nodeKey;
    const hasSubmittedFiles = Boolean(
      targetItem?.fileUrls?.length ||
      targetItem?.originalFilenames?.length ||
      targetItem?.submittedAt,
    );

    if (!hasSubmittedFiles) {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 sm:px-2.5 sm:py-1 sm:text-[11px]">
          File submitted
        </span>
      </div>
    );
  };

  const renderSubTree = (nodes, formId, depth = 0) => {
    return (nodes || []).map((node) => {
      const hasChildren = node.children.length > 0;
      const expanded = isNodeExpanded("subform", node.id);
      const depthOffset = Math.min(depth * 10, 52);

      return (
        <div key={`subform-${node.id}`} className="space-y-2">
          <div
            className={`relative rounded-lg border px-2 py-2 sm:px-3 ${
              hasChildren
                ? "border-slate-200/80 bg-white/70 dark:border-slate-700 dark:bg-slate-800/70"
                : "border-amber-200/70 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20"
            }`}
            style={{ marginLeft: `${depthOffset}px` }}
          >
            {depth > 0 ? (
              <>
                <div className="absolute -left-3 inset-y-0 w-px bg-slate-200/80 dark:bg-slate-700/80" />
                <div className="absolute -left-3 top-6 h-px w-3 bg-slate-300/70 dark:bg-slate-600" />
              </>
            ) : null}

            <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  if (hasChildren) {
                    toggleNodeExpansion("subform", node.id);
                    return;
                  }
                  startLeafUpload(
                    node.statusItems,
                    getNodeKey("subform", node.id),
                    node.formName,
                  );
                }}
                className="flex min-w-0 flex-1 items-center gap-1.5 text-left sm:gap-2"
              >
                {hasChildren ? (
                  expanded ? (
                    <ChevronUp
                      size={18}
                      className="text-amber-600 dark:text-amber-400 flex-shrink-0"
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      className="text-amber-600 dark:text-amber-400 flex-shrink-0"
                    />
                  )
                ) : (
                  <span className="inline-flex h-4 w-4 items-center justify-center flex-shrink-0">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                  </span>
                )}
                <p className="min-w-0 flex-1 break-words whitespace-normal leading-5 sm:leading-6">
                  <span
                    className={`font-montserrat text-[11px] sm:text-[13px] ${hasChildren ? "font-medium text-slate-700 dark:text-slate-200" : "text-amber-700 dark:text-amber-300"}`}
                  >
                    {node.formName}
                  </span>
                </p>
              </button>
              <div className="flex items-center gap-1 sm:gap-2">
                {!hasChildren
                  ? renderLeafSubmissionAction(
                      node.statusItems,
                      getNodeKey("subform", node.id),
                      node.formName,
                    )
                  : null}
                {renderStatusBadges(node.statusItems)}
              </div>
            </div>
          </div>

          <div
            className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
              hasChildren && expanded
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="ml-2 space-y-2 border-l border-slate-200/80 pl-2 dark:border-slate-700/80 sm:ml-3 sm:pl-3">
                {renderSubTree(node.children, formId, depth + 1)}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  const renderTitleRow = (title) => {
    return (
        <div key={title.id} className="border-b border-slate-300/80 dark:border-slate-700 pb-1">
        <div className="flex min-w-0 items-center justify-between gap-2 py-2 sm:gap-4 sm:py-3">
          <button
            type="button"
            onClick={() => toggleTitleExpansion(title.id)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left hover:opacity-90 transition sm:gap-3"
          >
            {isTitleExpanded(title.id) ? (
              <ChevronUp
                size={16}
                className="text-amber-600 dark:text-amber-400 flex-shrink-0"
              />
            ) : (
              <ChevronDown
                size={16}
                className="text-amber-600 dark:text-amber-400 flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-montserrat font-medium text-xs text-slate-700 dark:text-slate-200 leading-snug break-words whitespace-normal sm:text-base">
                {title.title}
              </h3>
            </div>
          </button>
        </div>

        <div
          className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
            isTitleExpanded(title.id)
              ? "grid-rows-[1fr] opacity-100 pb-3"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-1.5 pl-3 sm:pl-7">
              {title.ComplianceForms.map((form) => {
                const formExpanded = isNodeExpanded("form", form.id);
                const hasChildren = form.children.length > 0;

                return (
                  <div key={`form-${form.id}`} className="space-y-1">
                    <div
                      className={`relative rounded-lg border px-2 py-2 sm:px-3 ${
                        hasChildren
                          ? "border-slate-200/80 bg-white/70 dark:border-slate-700 dark:bg-slate-800/70"
                          : "border-amber-200/70 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20"
                      }`}
                    >
                      <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (hasChildren) {
                              toggleNodeExpansion("form", form.id);
                              return;
                            }
                            startLeafUpload(
                              form.statusItems,
                              getNodeKey("form", form.id),
                              form.formName,
                            );
                          }}
                          className="flex min-w-0 flex-1 items-center gap-1.5 text-left sm:gap-2"
                        >
                          {hasChildren ? (
                            formExpanded ? (
                              <ChevronUp
                                size={20}
                                className="text-amber-600 dark:text-amber-400 flex-shrink-0"
                              />
                            ) : (
                              <ChevronDown
                                size={20}
                                className="text-amber-600 dark:text-amber-400 flex-shrink-0"
                              />
                            )
                          ) : (
                            <span className="inline-flex h-4 w-4 items-center justify-center flex-shrink-0">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                            </span>
                          )}
                          <p className="min-w-0 flex-1 break-words whitespace-normal leading-5 sm:leading-6">
                            <span
                              className={`font-montserrat text-[11px] sm:text-[13px] ${
                                hasChildren
                                  ? "font-medium text-slate-700 dark:text-slate-200"
                                  : "text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              {form.formName}
                            </span>
                          </p>
                        </button>
                        <div className="flex items-center gap-1 sm:gap-2">
                          {!hasChildren
                            ? renderLeafSubmissionAction(
                                form.statusItems,
                                getNodeKey("form", form.id),
                                form.formName,
                              )
                            : null}
                          {renderStatusBadges(form.statusItems)}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
                        hasChildren && formExpanded
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="mt-2 space-y-2 border-l border-slate-200/80 pl-2 dark:border-slate-700/80 sm:pl-3">
                          {renderSubTree(form.children, form.id)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header Banner */}
      <div
        className="relative overflow-hidden bg-cover bg-bottom bg-no-repeat rounded-md border border-white/20 shadow-xl"
        style={{ backgroundImage: `url(${dashboard})`, minHeight: "220px" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-emerald-950/45 to-sky-950/60" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-16 text-center">
          <h1 className="mt-2 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold text-white tracking-tight">
            Compliance Status
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Track the status of the National Development Company requirements
            and compliance.
          </p>
        </div>
      </div>

      {/* Content Card */}
      <div className="-mt-12 relative z-20 mb-8">
        <div className="w-full mx-auto px-4 sm:px-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-lg p-4 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Assigned Compliance Status
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  View the compliance items assigned to you within the
                  compliance hierarchy.
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] sm:text-xs font-semibold text-white">
                      C
                    </span>
                    <span className="whitespace-nowrap">Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-sky-500 text-[10px] sm:text-xs font-semibold text-white">
                      UE
                    </span>
                    <span className="whitespace-nowrap">Under Evaluation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gray-300 text-[10px] sm:text-xs font-semibold text-slate-700">
                      NS
                    </span>
                    <span className="whitespace-nowrap">No Submission</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-amber-400 text-[10px] sm:text-xs font-semibold text-white">
                      NC
                    </span>
                    <span className="whitespace-nowrap">Non-Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-500 text-[10px] sm:text-xs font-semibold text-white">
                      NA
                    </span>
                    <span className="whitespace-nowrap">Not Applicable</span>
                  </div>
                </div>

                <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
                  <div className="relative text-sm sm:col-span-2 lg:col-span-1">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by title, path, submitter, or filename"
                      className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 sm:text-sm"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs dark:border-slate-700 dark:bg-slate-900 sm:text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="Compliant">Compliant</option>
                      <option value="Under Evaluation">Under Evaluation</option>
                      <option value="No Submission">No Submission</option>
                      <option value="Non-Compliant">Non-Compliant</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>

                  <div className="relative">
                    <select
                      value={yearFilter}
                      onChange={(event) => setYearFilter(event.target.value)}
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs dark:border-slate-700 dark:bg-slate-900 sm:text-sm"
                    >
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mx-auto px-4 sm:px-6 pb-8">
        {buildStatusTree.length === 0 ? (
          <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No assigned compliance status items found.
            </p>
          </div>
        ) : (
          <>
            <div className="block lg:hidden space-y-1">
              {buildStatusTree.map((title) => renderTitleRow(title))}
            </div>

            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-x-8">
              <div className="space-y-1">
                {leftColumnTitles.map((title) => renderTitleRow(title))}
              </div>
              <div className="space-y-1">
                {rightColumnTitles.map((title) => renderTitleRow(title))}
              </div>
            </div>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_UPLOAD_TYPES}
        onChange={handleFileSelected}
        className="hidden"
      />
    </div>
  );
};

export default ComplianceStatus;
