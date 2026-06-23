const Nickname = ({ member }) => {
  const activeColor = member.hexCode || "#000";

  const userId =
    member.memberId ||
    member.communityWriter ||
    member.marketWriter ||
    member.communityCommentWriter ||
    member.marketCommentWriter ||
    member.senderId;
  const displayName =
    member.memberName || member.senderName
      ? `${member.memberName || member.senderName} (${userId})`
      : userId;

  return (
    <span
      style={{
        color: activeColor,
      }}
    >
      {displayName}
    </span>
  );
};

export default Nickname;
