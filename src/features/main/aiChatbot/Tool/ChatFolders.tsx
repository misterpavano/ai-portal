import React, { useMemo, useState } from "react";
import { Box, Typography, IconButton, Chip } from "@mui/material";
import {
  IconSearch,
  IconEdit,
  IconPlus,
  IconChevronDown,
  IconDotsVertical,
  IconClock,
  IconMessages,
  IconFolderOpen,
} from "@tabler/icons-react";
import CreateFolderModal from "./Modals/CreateFolderModal";
import FolderActionsModal from "./Modals/FolderActionsModal";
import RenameFolderModal from "./Modals/RenameFolderModal";
import DeleteFolderModal from "./Modals/DeleteFolderModal";
import ConversationActionsModal from "./Modals/ConversationActionsModal";
import ConversationDetailsModal from "./Modals/ConversationDetailsModal";
import DeleteConversationModal from "./Modals/DeleteConversationModal";
import SearchConversationsModal from "./Modals/SearchConversationsModal";
import MoveToFolderModal from "./Modals/MoveToFolderModal";
import {
  useFetchFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useFetchConversationsQuery,
  useUpdateConversationMutation,
  useDeleteConversationMutation,
} from "../../../../api/slices/conversationsApiSlice";
import {
  IFolder,
  IConversation,
} from "../../../../types/response/conversations";

interface ChatFoldersProps {
  onClearChat?: () => void;
  onCreateNewConversation?: () => void;
  onLoadConversation?: (conversationId: string) => void;
  currentConversationId?: string | null;
  onConversationUpdated?: (conversation: IConversation) => void;
}

const ChatFolders: React.FC<ChatFoldersProps> = ({
  onClearChat,
  onCreateNewConversation,
  onLoadConversation,
  currentConversationId,
  onConversationUpdated,
}) => {
  const [openCreate, setOpenCreate] = useState(false);
  const [openRename, setOpenRename] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<IFolder | null>(null);

  // Conversation modals state
  const [conversationAnchorEl, setConversationAnchorEl] =
    useState<HTMLElement | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<IConversation | null>(null);
  const [openConversationDetails, setOpenConversationDetails] = useState(false);
  const [openDeleteConversation, setOpenDeleteConversation] = useState(false);
  const [openMoveToFolder, setOpenMoveToFolder] = useState(false);

  // Expand/collapse state
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [uncategorizedExpanded, setUncategorizedExpanded] = useState(true);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
    new Set(),
  );

  // Search modal state
  const [openSearchModal, setOpenSearchModal] = useState(false);

  // API Hooks
  const { data: folders = [], isLoading: foldersLoading } =
    useFetchFoldersQuery();
  const { data: conversationsData = [], isLoading: conversationsLoading } =
    useFetchConversationsQuery({ includeTemporary: false });
  const [createFolder] = useCreateFolderMutation();
  const [updateFolder] = useUpdateFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();
  const [updateConversation] = useUpdateConversationMutation();
  const [deleteConversation] = useDeleteConversationMutation();
  const conversations = useMemo<IConversation[]>(() => {
    const list = Array.isArray(conversationsData) ? conversationsData : [];
    return [...list].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [conversationsData]);

  const isLoading = foldersLoading || conversationsLoading;

  const handleOpenCreate = () => setOpenCreate(true);
  const handleCloseCreate = () => setOpenCreate(false);

  const handleCreateFolder = async (folderName: string) => {
    try {
      await createFolder({ name: folderName }).unwrap();
      handleCloseCreate();
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  // Popover
  const handleOpenPopover = (
    event: React.MouseEvent<HTMLElement>,
    folder: IFolder,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedFolder(folder);
  };
  const handleClosePopover = () => setAnchorEl(null);

  // Rename Folder
  const handleOpenRename = () => setOpenRename(true);
  const handleCloseRename = () => setOpenRename(false);

  const handleRenameFolder = async (newName: string) => {
    if (!selectedFolder) return;
    try {
      await updateFolder({
        id: selectedFolder.id,
        data: { name: newName },
      }).unwrap();
      handleCloseRename();
      handleClosePopover();
    } catch (error) {
      console.error("Failed to rename folder:", error);
    }
  };

  // Delete Folder
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);

  const handleDeleteFolder = async (option: "uncategorized" | "delete") => {
    if (!selectedFolder) return;
    try {
      // Get all conversations in this folder BEFORE deleting the folder
      const folderConversations = conversations.filter(
        (conv) => conv.folderId === selectedFolder.id && !conv.isTemporary,
      );

      // Check if current conversation is in this folder
      const isCurrentConversationInFolder =
        currentConversationId &&
        folderConversations.some((conv) => conv.id === currentConversationId);

      // First, handle conversations based on the selected option
      if (option === "uncategorized") {
        // Find the Uncategorized folder dynamically
        const uncategorizedFolder = folders.find(
          (folder) => folder.name.toLowerCase() === "uncategorized",
        );

        if (!uncategorizedFolder) {
          console.error("Uncategorized folder not found");
          throw new Error("Uncategorized folder not found");
        }

        // Move all conversations to uncategorized FIRST
        for (const conv of folderConversations) {
          await updateConversation({
            id: conv.id,
            data: { folderId: uncategorizedFolder.id },
          }).unwrap();
        }
      } else if (option === "delete") {
        // Delete all conversations in the folder FIRST
        for (const conv of folderConversations) {
          await deleteConversation(conv.id).unwrap();
        }
      }

      // THEN delete the folder after conversations are handled
      await deleteFolder(selectedFolder.id).unwrap();

      // If current conversation was in this folder (and deleted or folder deleted), clear the chat
      if (isCurrentConversationInFolder && onClearChat) {
        onClearChat();
      }

      handleCloseDelete();
      handleClosePopover();
    } catch (error) {
      console.error("Failed to delete folder:", error);
      // Don't close the modal if there was an error
    }
  };

  // Get conversations for a specific folder
  const getConversationsForFolder = (folderId: string): IConversation[] => {
    // Filter out temporary conversations and get conversations for the folder
    return conversations.filter(
      (conv) => conv.folderId === folderId && !conv.isTemporary,
    );
  };

  const handleCreateNewConversation = () => {
    if (onCreateNewConversation) {
      onCreateNewConversation();
    }
  };

  const handleConversationClick = (conversation: IConversation) => {
    // Don't reload if this conversation is already selected
    if (currentConversationId === conversation.id) {
      return;
    }

    if (onLoadConversation) {
      onLoadConversation(conversation.id);
    }
  };

  // Toggle expand/collapse for sections and folders
  const toggleFoldersSection = () => {
    setFoldersExpanded(!foldersExpanded);
  };

  const toggleUncategorizedSection = () => {
    setUncategorizedExpanded(!uncategorizedExpanded);
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Conversation handlers
  const handleOpenConversationMenu = (
    event: React.MouseEvent<HTMLElement>,
    conversation: IConversation,
  ) => {
    setConversationAnchorEl(event.currentTarget);
    setSelectedConversation(conversation);
  };

  const handleCloseConversationMenu = () => {
    setConversationAnchorEl(null);
  };

  const handleViewConversationDetails = () => {
    setOpenConversationDetails(true);
  };

  const handleCloseConversationDetails = () => {
    setOpenConversationDetails(false);
  };

  const handleSaveConversationDetails = async (
    conversationId: string,
    updates: { title?: string; folderId?: string },
  ) => {
    try {
      const updatedConversation = await updateConversation({
        id: conversationId,
        data: updates,
      }).unwrap();

      // Notify parent component about the update
      if (onConversationUpdated) {
        onConversationUpdated({
          ...updatedConversation,
          folder: updatedConversation.folderId
            ? folders.find((f) => f.id === updatedConversation.folderId) ||
              undefined
            : undefined,
        });
      }
    } catch (error) {
      console.error("Failed to update conversation:", error);
    }
  };

  const handleOpenDeleteConversation = () => {
    setOpenDeleteConversation(true);
  };

  const handleCloseDeleteConversation = () => {
    setOpenDeleteConversation(false);
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    try {
      await deleteConversation(selectedConversation.id).unwrap();
      handleCloseDeleteConversation();
      handleCloseConversationMenu();

      // Clear the chat after successful deletion
      if (onClearChat) {
        onClearChat();
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleOpenMoveToFolder = () => {
    setOpenMoveToFolder(true);
  };

  const handleCloseMoveToFolder = () => {
    setOpenMoveToFolder(false);
  };

  const handleMoveToFolder = async (
    conversationId: string,
    folderId: string | undefined,
  ) => {
    try {
      const updatedConversation = await updateConversation({
        id: conversationId,
        data: { folderId },
      }).unwrap();

      // Notify parent component about the update
      if (onConversationUpdated) {
        onConversationUpdated({
          ...updatedConversation,
          folder: updatedConversation.folderId
            ? folders.find((f) => f.id === updatedConversation.folderId) ||
              undefined
            : undefined,
        });
      }
      handleCloseMoveToFolder();
      handleCloseConversationMenu();
    } catch (error) {
      console.error("Failed to move conversation:", error);
    }
  };

  return (
    <Box
      style={{
        width: "250px",
        backgroundColor: "#FAFAF9",
        padding: "16px",
        display: "flex",
        flexShrink: 0,
        flexDirection: "column",
      }}
    >
      {/* Create New Conversation and Search Button */}
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <IconButton
          size="small"
          onClick={() => setOpenSearchModal(true)}
          style={{
            backgroundColor: "#fff",
            border: "1px solid #D6D3D1",
            borderRadius: "8px",
            padding: "6px 2px",
            gap: 4,
            flex: 1,
          }}
          title="Search conversations"
        >
          <IconSearch size={18} color="#57534E" />
          <Typography variant="body2" style={{ color: "#57534E" }}>
            Search conversations...
          </Typography>
        </IconButton>
        <IconButton
          size="small"
          onClick={handleCreateNewConversation}
          style={{
            backgroundColor: "#fff",
            border: "1px solid #D6D3D1",
            borderRadius: "8px",
            padding: "6px",
          }}
          title="Create new conversation"
        >
          <IconEdit size={18} color="black" />
        </IconButton>
      </Box>

      {/* Loading State */}
      {isLoading ? (
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px 0",
          }}
        >
          <Typography variant="body2" style={{ color: "#57534E" }}>
            Loading conversations...
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <Box
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                borderRadius: "10px",
              }}
            >
              <IconButton size="small" onClick={toggleFoldersSection}>
                <IconChevronDown
                  size={20}
                  style={{
                    transform: foldersExpanded
                      ? "rotate(0deg)"
                      : "rotate(-90deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </IconButton>
              <Typography
                variant="h6"
                style={{
                  fontWeight: 600,
                  color: "#A8A29E",
                  fontSize: 14,
                  letterSpacing: 4,
                }}
              >
                FOLDERS
              </Typography>
            </Box>
            <IconButton
              size="small"
              style={{ marginLeft: "8px" }}
              onClick={handleOpenCreate}
            >
              <IconPlus size={20} />
            </IconButton>
          </Box>
          {folders.length === 0 && (
            <Box
              style={{
                backgroundColor: "white",
                border: "1px solid #D6D3D1",
                borderRadius: "6px",
                padding: "4px 8px",
                display: "flex",
                marginBottom: "16px",
                flexDirection: "column",
              }}
            >
              <Box
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "10px",
                }}
              >
                <Typography
                  variant="h6"
                  style={{ fontSize: 13, paddingBottom: "10px" }}
                >
                  No folders found. Create folders to organize your
                  conversations.
                </Typography>
              </Box>
              <Typography
                variant="h6"
                style={{
                  fontSize: 13,
                  color: "red",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={handleOpenCreate}
              >
                Create your first folder.
              </Typography>
            </Box>
          )}

          {/* Folder List */}
          {foldersExpanded &&
            (folders.length === 1 ? (
              <Box
                style={{
                  backgroundColor: "white",
                  border: "1px solid #D6D3D1",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  display: "flex",
                  marginBottom: "16px",
                  flexDirection: "column",
                }}
              >
                <Box
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "10px",
                  }}
                >
                  <Typography
                    variant="h6"
                    style={{ fontSize: 13, paddingBottom: "10px" }}
                  >
                    No folders found. Create folders to organize your
                    conversations.
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  style={{
                    fontSize: 13,
                    color: "red",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={handleOpenCreate}
                >
                  Create your first folder.
                </Typography>
              </Box>
            ) : (
              folders
                .filter((folder: IFolder) => folder.name !== "Uncategorized")
                .map((folder: IFolder) => {
                  const folderConversations = getConversationsForFolder(
                    folder.id,
                  ).sort(
                    (a, b) =>
                      new Date(b.lastActivityAt).getTime() -
                      new Date(a.lastActivityAt).getTime(),
                  );
                  const isFolderExpanded = expandedFolderIds.has(folder.id);
                  return (
                    <Box
                      key={folder.id}
                      style={{
                        marginBottom: "2px",
                        backgroundColor: isFolderExpanded ? "white" : "",
                      }}
                    >
                      {/* Folder Header */}
                      <Box
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                          padding: "0 8px",
                        }}
                      >
                        <Box style={{ display: "flex", alignItems: "center" }}>
                          <IconFolderOpen
                            size={18}
                            style={{ marginRight: "8px" }}
                          />
                          <Typography style={{ fontSize: 15 }}>
                            {folder.name} ({folderConversations.length})
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={(e) => handleOpenPopover(e, folder)}
                          >
                            <IconDotsVertical size={18} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => toggleFolder(folder.id)}
                          >
                            <IconChevronDown
                              size={18}
                              style={{
                                transform: isFolderExpanded
                                  ? "rotate(0deg)"
                                  : "rotate(-90deg)",
                                transition: "transform 0.2s",
                              }}
                            />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Conversations in this folder */}
                      {isFolderExpanded && folderConversations.length > 0 && (
                        <Box
                          style={{
                            paddingLeft: "8px",
                          }}
                        >
                          {folderConversations.map((conv) => {
                            const isSelected =
                              currentConversationId === conv.id;
                            return (
                              <Box
                                key={conv.id}
                                style={{
                                  width: "85%",
                                  borderRadius: "6px",
                                  padding: "4px 12px",
                                  display: "flex",
                                  marginBottom: "8px",
                                  cursor: "pointer",
                                  alignItems: "center",
                                  backgroundColor: isSelected
                                    ? "#F5F5F4"
                                    : "white",
                                  justifyContent: "space-between",
                                }}
                                onClick={() => handleConversationClick(conv)}
                              >
                                <Box
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    flex: 1,
                                  }}
                                >
                                  <IconMessages size={19} />
                                  <Box
                                    style={{
                                      flex: 1,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <Typography
                                      style={{
                                        fontSize: 14,
                                        fontWeight: 550,
                                        color: "#1C1917",
                                        flex: 1,
                                      }}
                                    >
                                      {conv.title}
                                    </Typography>
                                    {conv.isTemporary && (
                                      <Chip
                                        icon={<IconClock size={10} />}
                                        label="Temporary"
                                        size="small"
                                        style={{
                                          height: "18px",
                                          fontSize: "9px",
                                          backgroundColor: "#FDF8ED",
                                          color: "#D4553F",
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenConversationMenu(e, conv);
                                  }}
                                >
                                  <IconDotsVertical size={16} />
                                </IconButton>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  );
                })
            ))}

          {/* Uncategorized Conversations */}
          {(() => {
            const uncategorizedFolder = folders.find(
              (f) => f.name === "Uncategorized",
            );
            const uncategorizedConversations = uncategorizedFolder
              ? getConversationsForFolder(uncategorizedFolder.id).sort(
                  (a, b) =>
                    new Date(b.lastActivityAt).getTime() -
                    new Date(a.lastActivityAt).getTime(),
                )
              : [];

            return (
              <>
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "16px",
                    marginBottom: "2px",
                  }}
                >
                  <Box
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "10px",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={toggleUncategorizedSection}
                    >
                      <IconChevronDown
                        size={20}
                        style={{
                          transform: uncategorizedExpanded
                            ? "rotate(0deg)"
                            : "rotate(-90deg)",
                          transition: "transform 0.2s",
                        }}
                      />
                    </IconButton>
                    <Typography
                      variant="h6"
                      style={{
                        fontWeight: 600,
                        color: "#A8A29E",
                        fontSize: 13,
                        letterSpacing: 4,
                      }}
                    >
                      UNCATEGORIZED ({uncategorizedConversations.length})
                    </Typography>
                  </Box>
                </Box>

                {uncategorizedExpanded &&
                  (uncategorizedConversations.length === 0 ? (
                    <Box
                      style={{
                        backgroundColor: "white",
                        border: "1px solid #D6D3D1",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        display: "flex",
                        marginBottom: "16px",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          borderRadius: "10px",
                        }}
                      >
                        <Typography
                          variant="h6"
                          style={{
                            fontSize: 13,
                          }}
                        >
                          No conversations found. Start a new conversation
                          today!
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      style={{
                        marginBottom: "16px",
                        maxHeight: "400px",
                        overflowY: "auto",
                        overflowX: "hidden",
                      }}
                    >
                      {uncategorizedConversations.map((conv) => {
                        const isSelected = currentConversationId === conv.id;
                        return (
                          <Box
                            key={conv.id}
                            style={{
                              padding: "2px 12px",
                              marginBottom: "8px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              backgroundColor: isSelected ? "white" : "",

                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                            onClick={() => handleConversationClick(conv)}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = "white";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor =
                                  "#F5F5F4";
                              }
                            }}
                          >
                            <Box
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flex: 1,
                              }}
                            >
                              <IconMessages size={18} />
                              <Box
                                style={{
                                  flex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <Typography
                                  style={{
                                    fontSize: 15,
                                    color: "#1C1917",
                                    flex: 1,
                                  }}
                                >
                                  {conv.title}
                                </Typography>
                                {conv.isTemporary && (
                                  <Chip
                                    icon={<IconClock size={10} />}
                                    label="24h"
                                    size="small"
                                    style={{
                                      height: "18px",
                                      fontSize: "9px",
                                      backgroundColor: "#FDF8ED",
                                      color: "#D4553F",
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenConversationMenu(e, conv);
                              }}
                            >
                              <IconDotsVertical size={16} />
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
              </>
            );
          })()}
        </>
      )}
      <CreateFolderModal
        open={openCreate}
        onClose={handleCloseCreate}
        onCreate={handleCreateFolder}
      />
      <FolderActionsModal
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClosePopover}
        onRename={handleOpenRename}
        onDelete={handleOpenDelete}
      />
      <RenameFolderModal
        open={openRename}
        onClose={handleCloseRename}
        onRename={handleRenameFolder}
        initialName={selectedFolder?.name || ""}
      />
      <DeleteFolderModal
        open={openDelete}
        onClose={handleCloseDelete}
        onDelete={handleDeleteFolder}
        folderName={selectedFolder?.name || ""}
      />
      <ConversationActionsModal
        anchorEl={conversationAnchorEl}
        open={Boolean(conversationAnchorEl)}
        onClose={handleCloseConversationMenu}
        onViewDetails={handleViewConversationDetails}
        onDelete={handleOpenDeleteConversation}
        onMoveToFolder={handleOpenMoveToFolder}
      />
      <ConversationDetailsModal
        open={openConversationDetails}
        onClose={handleCloseConversationDetails}
        conversation={selectedConversation}
        folders={folders}
        onSave={handleSaveConversationDetails}
      />
      <DeleteConversationModal
        open={openDeleteConversation}
        onClose={handleCloseDeleteConversation}
        onDelete={handleDeleteConversation}
        conversationTitle={selectedConversation?.title || ""}
      />
      <SearchConversationsModal
        open={openSearchModal}
        onClose={() => setOpenSearchModal(false)}
        onSelectConversation={(conversationId) => {
          if (onLoadConversation) {
            onLoadConversation(conversationId);
          }
        }}
        currentConversationId={currentConversationId}
      />
      <MoveToFolderModal
        open={openMoveToFolder}
        onClose={handleCloseMoveToFolder}
        onMove={handleMoveToFolder}
        conversation={selectedConversation}
        folders={folders}
      />
    </Box>
  );
};

export default ChatFolders;
