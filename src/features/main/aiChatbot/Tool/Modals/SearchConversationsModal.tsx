import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  TextField,
  Typography,
  IconButton,
  Box,
  List,
  ListItem,
  ListItemButton,
  Chip,
} from "@mui/material";
import {
  IconX,
  IconSearch,
  IconMessages,
  IconClock,
  IconFolderOpen,
} from "@tabler/icons-react";
import { useFetchConversationsQuery } from "../../../../../api/slices/conversationsApiSlice";
import { IConversation } from "../../../../../types/response/conversations";

interface SearchConversationsModalProps {
  open: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
  currentConversationId?: string | null;
}

const SearchConversationsModal: React.FC<SearchConversationsModalProps> = ({
  open,
  onClose,
  onSelectConversation,
  currentConversationId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setDebouncedSearchQuery("");
    }
  }, [open]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch conversations with search
  const { data: searchResults = [], isLoading } = useFetchConversationsQuery(
    debouncedSearchQuery.trim()
      ? { search: debouncedSearchQuery.trim(), includeTemporary: false }
      : { includeTemporary: false },
    { skip: !open || !debouncedSearchQuery.trim() },
  );

  const handleClose = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    onClose();
  };

  const handleConversationClick = (conversation: IConversation) => {
    onSelectConversation(conversation.id);
    handleClose();
  };

  const highlightText = (text: string, keyword?: string) => {
    if (!keyword) return text;
    const parts = text.split(new RegExp(`(${keyword})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span
          key={index}
          style={{ backgroundColor: "#C4A35A", fontWeight: 600 }}
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          width: 600,
          minWidth: 500,
          maxHeight: "80vh",
          borderRadius: 12,
          padding: "0px",
        },
      }}
    >
      <DialogTitle
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        Search Conversations
        <IconButton onClick={handleClose} size="small">
          <IconX />
        </IconButton>
      </DialogTitle>
      <Divider style={{ borderColor: "#A8A29E", margin: "0 16px" }} />
      <DialogContent style={{ paddingTop: 16, paddingBottom: 16 }}>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#FAFAF9",
            border: "1px solid #D6D3D1",
            borderRadius: 6,
            padding: "8px 12px",
            marginBottom: 16,
          }}
        >
          <IconSearch size={18} color="#A8A29E" />
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search by title or message content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              disableUnderline: true,
              style: {
                marginLeft: 8,
                fontSize: 14,
              },
            }}
            autoFocus
          />
        </Box>
        {isLoading && debouncedSearchQuery.trim() && (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "40px 0",
            }}
          >
            <Typography variant="body2" style={{ color: "#57534E" }}>
              Searching...
            </Typography>
          </Box>
        )}
        {!isLoading &&
          debouncedSearchQuery.trim() &&
          searchResults.length === 0 && (
            <Box
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 0",
              }}
            >
              <Typography variant="body2" style={{ color: "#57534E" }}>
                No conversations found matching "{debouncedSearchQuery}"
              </Typography>
            </Box>
          )}
        {!isLoading &&
          debouncedSearchQuery.trim() &&
          searchResults.length > 0 && (
            <Box
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <List>
                {searchResults.map((conversation) => {
                  const isSelected = currentConversationId === conversation.id;
                  return (
                    <ListItem
                      key={conversation.id}
                      disablePadding
                      style={{ marginBottom: 8 }}
                    >
                      <ListItemButton
                        onClick={() => handleConversationClick(conversation)}
                        style={{
                          backgroundColor: isSelected ? "#F5F5F4" : "white",
                          border: "1px solid #D6D3D1",
                          borderRadius: 6,
                          padding: "12px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <Box
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "95%",
                          }}
                        >
                          <Box
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <IconMessages
                              size={18}
                              style={{ marginRight: 6 }}
                            />
                            <Typography
                              style={{
                                fontSize: 15,
                                fontWeight: 600,
                                color: "#1C1917",
                              }}
                            >
                              {conversation.searchMatch?.matchType === "title"
                                ? highlightText(
                                    conversation.title,
                                    conversation.searchMatch?.keyword,
                                  )
                                : conversation.title}
                            </Typography>
                          </Box>
                          {conversation.folder && (
                            <Box
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginTop: 4,
                                marginLeft: 24,
                              }}
                            >
                              <IconFolderOpen
                                size={14}
                                color="#57534E"
                                style={{ marginRight: 4 }}
                              />
                              <Typography
                                variant="caption"
                                style={{ color: "#57534E", fontSize: 12 }}
                              >
                                {conversation.folder.name}
                              </Typography>
                            </Box>
                          )}
                          {conversation.isTemporary && (
                            <Chip
                              icon={<IconClock size={10} />}
                              label="Temporary"
                              size="small"
                              style={{
                                alignSelf: "flex-start",
                                marginTop: 4,
                                height: "18px",
                                fontSize: "9px",
                                backgroundColor: "#FDF8ED",
                                color: "#D4553F",
                              }}
                            />
                          )}
                        </Box>
                        {conversation.searchMatch?.matchType === "keyword" && (
                          <Box
                            style={{
                              width: "95%",
                              padding: "8px",
                              backgroundColor: "#FAFAF9",
                              borderRadius: 4,
                              marginTop: 4,
                            }}
                          >
                            <Typography
                              variant="caption"
                              style={{
                                fontSize: 12,
                                color: "#57534E",
                                fontStyle: "italic",
                              }}
                            >
                              {highlightText(
                                conversation.searchMatch.matchedText,
                                conversation.searchMatch.keyword,
                              )}
                            </Typography>
                          </Box>
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
        {!debouncedSearchQuery.trim() && (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "40px 0",
            }}
          >
            <Typography variant="body2" style={{ color: "#57534E" }}>
              Enter a search term to find conversations
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchConversationsModal;
