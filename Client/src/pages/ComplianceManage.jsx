import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  EllipsisVertical,
} from "lucide-react";
import dashboard from "../assets/dashboard.png";
import api, { endpoints } from "../config/api.js";
import SweetAlert from "../components/SweetAlert.jsx";

const ComplianceManage = () => {
  const [titles, setTitles] = useState([]);
  const [expandedTitleIds, setExpandedTitleIds] = useState([]);
  const [expandedNodeIds, setExpandedNodeIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  const [editingTitle, setEditingTitle] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemTarget, setItemTarget] = useState(null);

  const [titleFormData, setTitleFormData] = useState({ title: "" });
  const [itemFormData, setItemFormData] = useState({ formName: "" });
  const [search, setSearch] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [menuItem, setMenuItem] = useState(null);

  useEffect(() => {
    fetchTitles(true);
  }, []);

  const fetchTitles = async (showFullLoading = false) => {
    try {
      if (showFullLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await api.get(endpoints.complianceForms.titles.getAll);
      if (response.data.error) {
        throw new Error(response.data.message || "Failed to fetch titles");
      }

      setTitles(response.data.data || []);
    } catch (error) {
      SweetAlert.toast.error(error.message || "Failed to load compliance forms");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getNodeKey = (type, id) => `${type}-${id}`;

  const toggleNodeExpansion = (type, id) => {
    const key = getNodeKey(type, id);
    setExpandedNodeIds((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

  const isNodeExpanded = (type, id) => expandedNodeIds.includes(getNodeKey(type, id));

  const isTitleExpanded = (titleId) => expandedTitleIds.includes(titleId);

  const toggleTitleExpansion = (titleId) => {
    setExpandedTitleIds((current) =>
      current.includes(titleId) ? current.filter((id) => id !== titleId) : [...current, titleId]
    );
  };

  const openMenu = (item, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    if (menuOpen && menuItem?.type === item.type && menuItem?.id === item.id) {
      setMenuOpen(false);
      setMenuItem(null);
      return;
    }

    const menuWidth = window.innerWidth < 420 ? 180 : 192;
    const safeRight = Math.min(
      Math.max(12, window.innerWidth - rect.left + 8),
      window.innerWidth - menuWidth - 12,
    );

    setMenuPos({
      top: Math.min(rect.top, Math.max(12, window.innerHeight - 220)),
      right: safeRight,
    });
    setMenuItem(item);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setMenuItem(null);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleScroll = () => closeMenu();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [menuOpen]);

  const normalizeSearchText = (value) => String(value || "").trim().toLowerCase();

  const extractTitleYear = (value) => {
    const text = String(value || "").trim();
    const match = text.match(/^(\d{4})\s+(.+)$/);
    if (!match) {
      return { year: "", title: text };
    }

    return {
      year: match[1],
      title: match[2].trim(),
    };
  };

  const handleAddTitle = () => {
    setEditingTitle(null);
    setTitleFormData({ title: "" });
    setShowTitleModal(true);
  };

  const handleEditTitle = (title) => {
    setEditingTitle(title);
    setTitleFormData({ title: title?.title || "" });
    setShowTitleModal(true);
  };

  const handleSaveTitle = async () => {
    if (!titleFormData.title.trim()) {
      SweetAlert.toast.error("Title is required");
      return;
    }

    const normalizedTitle = titleFormData.title.trim();

    try {
      if (editingTitle) {
        await api.put(endpoints.complianceForms.titles.update(editingTitle.id), {
          title: normalizedTitle,
        });
        SweetAlert.toast.success("Title updated successfully");
      } else {
        await api.post(endpoints.complianceForms.titles.create, {
          title: normalizedTitle,
        });
        SweetAlert.toast.success("Title created successfully");
      }
      setShowTitleModal(false);
      fetchTitles();
    } catch (error) {
      SweetAlert.toast.error(error.response?.data?.message || "Failed to save title");
    }
  };

  const handleDeleteTitle = async (titleId) => {
    if (window.confirm("Delete this title and all its nested items?")) {
      try {
        await api.delete(endpoints.complianceForms.titles.delete(titleId));
        SweetAlert.toast.success("Title deleted successfully");
        fetchTitles();
      } catch (error) {
        SweetAlert.toast.error(error.response?.data?.message || "Failed to delete title");
      }
    }
  };

  const handleOpenCreateForm = (titleId) => {
    setEditingItem(null);
    setItemTarget({ type: "form", titleId });
    setItemFormData({ formName: "" });
    setShowItemModal(true);
  };

  const handleOpenCreateSubItem = (formId, parentSubFormId = null) => {
    setEditingItem(null);
    setItemTarget({ type: "subform", formId, parentSubFormId });
    setItemFormData({ formName: "" });
    setShowItemModal(true);
  };

  const handleOpenEditForm = (titleId, form) => {
    setEditingItem({ type: "form", id: form.id });
    setItemTarget({ type: "form", titleId });
    setItemFormData({ formName: form.formName });
    setShowItemModal(true);
  };

  const handleOpenEditSubItem = (formId, subForm) => {
    setEditingItem({ type: "subform", id: subForm.id });
    setItemTarget({
      type: "subform",
      formId,
      parentSubFormId: subForm.ParentSubFormId || null,
    });
    setItemFormData({ formName: subForm.formName });
    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    if (!itemFormData.formName.trim()) {
      SweetAlert.toast.error("Item name is required");
      return;
    }

    try {
      if (editingItem?.type === "form") {
        await api.put(endpoints.complianceForms.forms.update(editingItem.id), itemFormData);
        SweetAlert.toast.success("Item updated successfully");
      } else if (editingItem?.type === "subform") {
        await api.put(endpoints.complianceForms.subforms.update(editingItem.id), itemFormData);
        SweetAlert.toast.success("Item updated successfully");
      } else if (itemTarget?.type === "form") {
        await api.post(endpoints.complianceForms.forms.create, {
          ComplianceFormsTitleId: itemTarget.titleId,
          ...itemFormData,
        });
        SweetAlert.toast.success("Item created successfully");
      } else if (itemTarget?.type === "subform") {
        await api.post(endpoints.complianceForms.subforms.create, {
          ComplianceFormsId: itemTarget.formId,
          ParentSubFormId: itemTarget.parentSubFormId,
          ...itemFormData,
        });
        SweetAlert.toast.success("Item created successfully");
      }

      setShowItemModal(false);
      fetchTitles();
    } catch (error) {
      SweetAlert.toast.error(error.response?.data?.message || "Failed to save item");
    }
  };

  const handleDeleteForm = async (formId) => {
    if (window.confirm("Delete this item and all nested items?")) {
      try {
        await api.delete(endpoints.complianceForms.forms.delete(formId));
        SweetAlert.toast.success("Item deleted successfully");
        fetchTitles();
      } catch (error) {
        SweetAlert.toast.error(error.response?.data?.message || "Failed to delete item");
      }
    }
  };

  const handleDeleteSubItem = async (subFormId) => {
    if (window.confirm("Delete this item and all nested items?")) {
      try {
        await api.delete(endpoints.complianceForms.subforms.delete(subFormId));
        SweetAlert.toast.success("Item deleted successfully");
        fetchTitles();
      } catch (error) {
        SweetAlert.toast.error(error.response?.data?.message || "Failed to delete item");
      }
    }
  };

  const renderSubFormTree = (nodes, formId, depth = 0) => {
    return (nodes || []).map((node) => {
      const children = Array.isArray(node.ComplianceSubForms) ? node.ComplianceSubForms : [];
      const hasChildren = children.length > 0;
      const expanded = isNodeExpanded("subform", node.id);
      const depthOffset = Math.min(depth * 14, 72);

      return (
        <div key={`subform-${node.id}`} className="group space-y-2">
          <div
            className={`relative flex min-w-0 items-start justify-between gap-2 rounded-lg border px-2 py-2 transition-colors text-sm sm:px-3 ${
              hasChildren
                ? "border-slate-200/80 bg-white/70 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800"
                : "border-amber-200/70 bg-amber-50/70 hover:bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
            }`}
            style={{ marginLeft: `${depthOffset}px` }}
          >
            {depth > 0 && (
              <>
                <div className="absolute -left-3 inset-y-0 w-px bg-slate-200/80 dark:bg-slate-700/80" />
                <div className="absolute -left-3 top-1/2 h-px w-3 -translate-y-1/2 bg-slate-300/70 dark:bg-slate-600" />
              </>
            )}
            <button
              onClick={() => hasChildren && toggleNodeExpansion("subform", node.id)}
              className="group flex min-w-0 flex-1 items-start gap-1.5 text-left sm:gap-2"
            >
              {hasChildren ? (
                expanded ? (
                  <ChevronUp size={14} className="mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                ) : (
                  <ChevronDown size={14} className="mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                )
              ) : (
                <span className="mt-1 inline-flex h-4 w-4 items-center justify-center flex-shrink-0">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                </span>
              )}
              <p className="min-w-0 flex-1 break-words whitespace-normal leading-5 sm:leading-6">
                <span
                  className={`font-montserrat text-[11px] sm:text-[13px] ${
                    !hasChildren
                      ? "text-amber-700 break-words whitespace-normal dark:text-amber-300"
                      : "font-medium text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {node.formName}
                </span>
              </p>
            </button>

            <div className="flex shrink-0 items-center gap-0.5 opacity-80 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:opacity-60">
              <button
                type="button"
                onClick={(e) => openMenu({ type: "subform", id: node.id, formId, item: node }, e)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700 transition sm:h-9 sm:w-9"
                aria-label="Open actions"
              >
                <EllipsisVertical size={15} className="pointer-events-none" />
              </button>
            </div>
          </div>

          <div
            className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
              hasChildren && expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="ml-2 space-y-2 border-l border-slate-200/80 pl-2 dark:border-slate-700/80 sm:ml-3 sm:pl-3">
                {renderSubFormTree(children, formId, depth + 1)}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  const filteredTitles = React.useMemo(() => {
    const query = normalizeSearchText(search);

    return (titles || []).filter((title) => {
      const titleText = normalizeSearchText(title.title);
      const forms = Array.isArray(title.ComplianceForms) ? title.ComplianceForms : [];

      const matchesSearch = !query
        ? true
        : [
            titleText,
            ...forms.flatMap((form) => [
              normalizeSearchText(form.formName),
              ...(Array.isArray(form.ComplianceSubForms)
                ? form.ComplianceSubForms.map((subForm) =>
                    normalizeSearchText(subForm.formName),
                  )
                : []),
            ]),
          ].some((value) => value.includes(query));

      return matchesSearch;
    });
  }, [search, titles]);

  const leftColumnTitles = filteredTitles.filter((_, index) => index % 2 === 0);
  const rightColumnTitles = filteredTitles.filter((_, index) => index % 2 === 1);

  const renderTitleRow = (title) => {
    return (
      <div key={title.id} className="border-b border-slate-300/80 dark:border-slate-700 pb-1">
        <div className="flex min-w-0 items-center justify-between gap-2 py-2 sm:gap-4 sm:py-3">
          <button
            onClick={() => toggleTitleExpansion(title.id)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left hover:opacity-90 transition sm:gap-3"
          >
            {isTitleExpanded(title.id) ? (
              <ChevronUp size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            ) : (
              <ChevronDown size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-montserrat font-medium text-xs text-slate-700 dark:text-slate-200 leading-snug break-words whitespace-normal sm:text-base">{title.title}</h3>
            </div>
          </button>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={(e) => openMenu({ type: "title", id: title.id, item: title }, e)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700 transition sm:h-9 sm:w-9"
              aria-label="Open actions"
            >
              <EllipsisVertical size={15} className="pointer-events-none" />
            </button>
          </div>
        </div>

        <div
          className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
            isTitleExpanded(title.id) ? "grid-rows-[1fr] opacity-100 pb-3" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            {Array.isArray(title.ComplianceForms) && title.ComplianceForms.length > 0 ? (
              <div className="space-y-1.5 pl-3 sm:pl-7">
              {title.ComplianceForms.map((form) => {
                const formExpanded = isNodeExpanded("form", form.id);
                const subForms = Array.isArray(form.ComplianceSubForms) ? form.ComplianceSubForms : [];
                const hasSubForms = subForms.length > 0;

                return (
                  <div key={`form-${form.id}`} className="group space-y-1">
                    <div
                      className={`relative flex min-w-0 items-start justify-between gap-2 rounded-lg border px-2 py-2 transition-colors text-sm sm:px-3 ${
                        hasSubForms
                          ? "border-slate-200/80 bg-white/70 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800"
                          : "border-amber-200/70 bg-amber-50/70 hover:bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20 dark:hover:bg-amber-950/30"
                      }`}
                    >
                      <button
                        onClick={() => hasSubForms && toggleNodeExpansion("form", form.id)}
                        className="group flex min-w-0 flex-1 items-start gap-1.5 text-left sm:gap-2"
                      >
                        {hasSubForms ? (
                          formExpanded ? (
                            <ChevronUp size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          )
                        ) : (
                          <span className="mt-1 inline-flex h-4 w-4 items-center justify-center flex-shrink-0">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                          </span>
                        )}
                        <p className="min-w-0 flex-1 break-words whitespace-normal font-montserrat text-[11px] leading-5 sm:text-sm sm:leading-6">
                          <span
                            className={
                              hasSubForms
                                ? "font-medium break-words whitespace-normal text-slate-700 dark:text-slate-200"
                                : "relative inline text-amber-700 break-words whitespace-normal dark:text-amber-300"
                            }
                          >
                            {form.formName}
                          </span>
                        </p>
                      </button>

                      <div className="flex shrink-0 items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:opacity-60">
                        <button
                          type="button"
                          onClick={(e) => openMenu({ type: "form", id: form.id, titleId: title.id, item: form }, e)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700 transition sm:h-9 sm:w-9"
                          aria-label="Open actions"
                        >
                          <EllipsisVertical size={15} className="pointer-events-none" />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
                        hasSubForms && formExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        {subForms.length > 0 ? (
                          <div className="mt-2 space-y-2 border-l border-slate-200/80 pl-2 dark:border-slate-700/80 sm:pl-3">
                            {renderSubFormTree(subForms, form.id)}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenCreateSubItem(form.id, null)}
                            className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                          >
                            Add child item
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => handleOpenCreateForm(title.id)}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
              >
                Add top-level item
              </button>
              </div>
            ) : (
              <button
                onClick={() => handleOpenCreateForm(title.id)}
                className="pl-4 sm:pl-7 text-xs text-amber-600 dark:text-amber-400 hover:underline"
              >
                Add top-level item
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-36 rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse" />
        <div className="h-24 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-72 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative px-2 sm:px-4 md:px-6">
      <div
        className="relative overflow-hidden bg-cover bg-bottom bg-no-repeat rounded-md border border-white/20 shadow-xl"
        style={{ backgroundImage: `url(${dashboard})`, minHeight: "220px" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-emerald-950/45 to-sky-950/60" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-16 text-center">
          <h1 className="mt-2 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-montserrat font-bold text-white tracking-tight">
            Manage Compliances
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Create a title and add nested compliance items.
          </p>
        </div>
      </div>

      <div className="-mt-12 relative z-20 mb-8">
        <div className="w-full mx-auto px-4 sm:px-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-lg p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Manage Compliances
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Create and organize the compliance hierarchy for the assigned year.
                </p>
              </div>

              <button
                onClick={handleAddTitle}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-emerald-700 hover:shadow-lg transition whitespace-nowrap"
              >
                <Plus size={16} />
                <span>Add Title</span>
              </button>
            </div>

            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="grid gap-3 md:grid-cols-1">
                <div className="relative">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search title, item, or sub-item"
                    className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-6 pb-8">
        {refreshing && (
          <div className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">Updating list...</div>
        )}

        {filteredTitles.length === 0 ? (
          <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">No matching compliance hierarchy found.</p>
          </div>
        ) : (
          <>
            <div className="block lg:hidden space-y-1">{filteredTitles.map((title) => renderTitleRow(title))}</div>

            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-x-8">
              <div className="space-y-1">{leftColumnTitles.map((title) => renderTitleRow(title))}</div>
              <div className="space-y-1">{rightColumnTitles.map((title) => renderTitleRow(title))}</div>
            </div>
          </>
        )}
      </div>

      {menuOpen && menuItem && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div
            className="fixed z-50 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            {menuItem.type === "title" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleEditTitle(menuItem.item);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Edit2 size={15} />
                  Edit Title
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleDeleteTitle(menuItem.id);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:text-rose-300 dark:hover:bg-slate-700"
                >
                  <Trash2 size={15} />
                  Delete Title
                </button>
              </>
            )}
            {menuItem.type === "form" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleOpenCreateSubItem(menuItem.id, null);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Plus size={15} />
                  Add Child Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleOpenEditForm(menuItem.titleId, menuItem.item);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Edit2 size={15} />
                  Edit Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleDeleteForm(menuItem.id);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:text-rose-300 dark:hover:bg-slate-700"
                >
                  <Trash2 size={15} />
                  Delete Item
                </button>
              </>
            )}
            {menuItem.type === "subform" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleOpenCreateSubItem(menuItem.formId, menuItem.id);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Plus size={15} />
                  Add Child Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleOpenEditSubItem(menuItem.formId, menuItem.item);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Edit2 size={15} />
                  Edit Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    handleDeleteSubItem(menuItem.id);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:text-rose-300 dark:hover:bg-slate-700"
                >
                  <Trash2 size={15} />
                  Delete Item
                </button>
              </>
            )}
          </div>
        </>
      )}

      {showTitleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-md shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {editingTitle ? "Edit Title" : "Add New Title"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={titleFormData.title}
                  onChange={(e) => setTitleFormData({ ...titleFormData, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter title, e.g. Compliance"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTitleModal(false)}
                className="flex-1 px-4 py-2.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTitle}
                className="flex-1 px-4 py-2.5 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-md shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {editingItem ? "Edit Item" : "Add Item"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name</label>
                <input
                  type="text"
                  value={itemFormData.formName}
                  onChange={(e) => setItemFormData({ ...itemFormData, formName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter item name"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowItemModal(false)}
                className="flex-1 px-4 py-2.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="flex-1 px-4 py-2.5 rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceManage;