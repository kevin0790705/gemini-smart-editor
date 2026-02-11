import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface RichTextEditorProps {
  data: string;
  onChange: (data: string) => void;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ data, onChange, disabled }) => {
  return (
    <div className="prose prose-lg max-w-none w-full bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
      <CKEditor
        editor={ClassicEditor}
        data={data}
        disabled={disabled}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          licenseKey: 'GPL',
          placeholder: 'Generated content will appear here...',
          toolbar: [
            'heading', '|',
            'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
            'insertTable', '|',
            'undo', 'redo'
          ],
        }}
      />
    </div>
  );
};

export default RichTextEditor;