type Props = {
  className: string;
};

const ChatCursorIcon = ({ className }: Props) => (
  <svg
    viewBox="8 4 8 16"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="10" y="6" width="4" height="12" fill="#000" />
  </svg>
);

export default ChatCursorIcon;
