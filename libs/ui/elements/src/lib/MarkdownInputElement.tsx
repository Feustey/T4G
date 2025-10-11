import { Elements } from "@t4g/types";
import dynamic, { LoaderComponent } from "next/dynamic";
import { draftjsToMd, mdToDraftjs } from "draftjs-md-converter";
import { useState } from "react";
import { convertToRaw, convertFromRaw, EditorState } from "draft-js";
import { EditorProps } from "react-draft-wysiwyg";

const Editor = dynamic<EditorProps>(
  () =>
    import("react-draft-wysiwyg").then(
      (mod) => mod.Editor
    ) as LoaderComponent<EditorProps>,
  { ssr: false }
) as React.FC<EditorProps>;

export const MarkdownInputElement = ({
  value,
  onChange,
  label,
  name,
  errorMessage,
  showError,
}: Elements.MarkdownInputElement.Props) => {
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createWithContent(convertFromRaw(mdToDraftjs(value || "")))
  );

  const onEditorStateChange = (_editorState: EditorState) => {
    setEditorState(_editorState);
    onChange(draftjsToMd(convertToRaw(_editorState.getCurrentContent())));
  };

  return (
    <div className="my-4">
      <label htmlFor={name} className={"text-gray-400"}>
        {label}
      </label>
      <div
        className={`Font w-full flex flex-col items-stretch justify-start bg-white border  ${
          showError ? "border-red-600" : "border-slate-300"
        }`}
      >
        <Editor
          toolbarClassName="toolbarClassName rounded-t-md w-full border-0"
          wrapperClassName="wrapperClassName rounded-t-md w-full flex flex-col justify-stretch items-stretch border-0 p-0"
          editorClassName="editorClassName prose max-box p-2"
          stripPastedStyles
          onEditorStateChange={onEditorStateChange}
          toolbar={{
            options: [
              "inline",
              "list",
              "link",
              "emoji",
              "history",
              "blockType",
            ],
            inline: {
              options: ["bold", "italic"],
            },
            blockType: {
              options: ["Normal", "H1", "H2"],
            },
            list: { options: ["unordered", "ordered"] },
            link: { showOpenOptionOnHover: false },
          }}
          editorState={editorState}
        />
      </div>

      {showError ? (
        <span className="text-base text-red-600">
          {errorMessage || "Error"}
        </span>
      ) : null}
    </div>
  );
};
