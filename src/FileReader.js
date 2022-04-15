import { useRef } from "react";

const InputFileReader = ({ onFileLoad, label }) => {
  const fileInputRef = useRef(null);
  let fileReader;

  const handleFileRead = () => {
    const content = fileReader.result;
    onFileLoad(content);
  };

  const handleFileChosen = (file) => {
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  };

  const onLoadFileClick = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      <input type="button" value={label} onClick={onLoadFileClick} />
      <input
        ref={fileInputRef}
        style={{display: 'none'}}
        type="file"
        id="file"
        className="input-file"
        accept=".rle"
        onChange={(e) => handleFileChosen(e.target.files[0])}
      />
    </>
  );
};

export default InputFileReader;
