/** Renders text where `**like this**` should be bold. */
export default function Rich({ text }) {
  return text.split('**').map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold">
        {part}
      </strong>
    ) : (
      part
    ),
  )
}
