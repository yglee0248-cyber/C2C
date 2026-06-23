import { Input, TextArea } from "../ui/Form";
import styles from "./Community.module.css";
import TextEditor from "../ui/TextEditor";
const CommunityFrm = ({ community, inputCommunity, inputCommunityContent }) => {
  return (
    <div className={styles.community_frm_wrap}>
      <div className={styles.input_wrap}>
        <label htmlFor="communityTitle">제목</label>
        <Input
          type="text"
          name="communityTitle"
          id="communityTitle"
          value={community.communityTitle}
          onChange={inputCommunity}
        />
      </div>

      <div className={styles.input_wrap}>
        <label htmlFor="communityContent">내용</label>
        <TextEditor
          data={community.communityContent}
          setData={inputCommunityContent}
        ></TextEditor>
      </div>
    </div>
  );
};

export default CommunityFrm;
