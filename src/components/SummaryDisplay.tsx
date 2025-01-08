import { FileText } from 'lucide-react'; // Replace with your icon library

const parseGemtextToJSX = (text) => {
  const lines = text.split('\n');
  const elements = [];
  let listBuffer = [];

  const parseInlineFormatting = (line) => {
    const formattedLine = line
      // Bold: **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Underline: __text__
      .replace(/__(.*?)__/g, '<u>$1</u>')
      // Links: [label](url)
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>');

    return <span dangerouslySetInnerHTML={{ __html: formattedLine }} />;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('### ')) {
      elements.push(<h3 key={index}>{parseInlineFormatting(trimmedLine.slice(4))}</h3>);
    } else if (trimmedLine.startsWith('## ')) {
      elements.push(<h2 key={index}>{parseInlineFormatting(trimmedLine.slice(3))}</h2>);
    } else if (trimmedLine.startsWith('# ')) {
      elements.push(<h1 key={index}>{parseInlineFormatting(trimmedLine.slice(2))}</h1>);
    } else if (trimmedLine.startsWith('=>')) {
      const [url, ...labelParts] = trimmedLine.slice(2).split(' ');
      const label = labelParts.join(' ') || url;
      elements.push(
        <p key={index}>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {label}
          </a>
        </p>
      );
    } else if (trimmedLine.startsWith('* ')) {
      listBuffer.push(<li key={index}>{parseInlineFormatting(trimmedLine.slice(2))}</li>);
    } else if (trimmedLine === '') {
      if (listBuffer.length > 0) {
        elements.push(<ul key={`ul-${index}`} className="list-disc pl-5">{listBuffer}</ul>);
        listBuffer = [];
      }
      elements.push(<br key={index} />);
    } else {
      if (listBuffer.length > 0) {
        elements.push(<ul key={`ul-${index}`} className="list-disc pl-5">{listBuffer}</ul>);
        listBuffer = [];
      }
      elements.push(<p key={index}>{parseInlineFormatting(trimmedLine)}</p>);
    }
  });

  if (listBuffer.length > 0) {
    elements.push(<ul key="ul-final" className="list-disc pl-5">{listBuffer}</ul>);
  }

  return elements;
};

const SummaryDisplay = ({ summary }) => {
  return summary ? (
    <div className="mt-8">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-gray-600" />
        <h2 className="text-xl font-semibold">Video Summary</h2>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="whitespace-pre-wrap">{parseGemtextToJSX(summary)}</div>
      </div>
    </div>
  ) : null;
};

export { SummaryDisplay };
