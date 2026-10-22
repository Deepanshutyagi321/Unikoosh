"use client";

export default function PairListEditor<T extends object>({
  items,
  onChange,
  keyA,
  keyB,
  labelA,
  labelB,
  addLabel,
  emptyItem,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  keyA: keyof T;
  keyB: keyof T;
  labelA: string;
  labelB: string;
  addLabel: string;
  emptyItem: T;
}) {
  function update(index: number, key: keyof T, value: string) {
    const next = [...items];
    next[index] = { ...next[index], [key]: value } as T;
    onChange(next);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function add() {
    onChange([...items, emptyItem]);
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 border border-border bg-paper-alt p-3">
          <div className="flex-1 space-y-2">
            <input
              className="admin-input"
              placeholder={labelA}
              value={String(item[keyA] ?? "")}
              onChange={(e) => update(i, keyA, e.target.value)}
            />
            <textarea
              className="admin-input"
              placeholder={labelB}
              rows={2}
              value={String(item[keyB] ?? "")}
              onChange={(e) => update(i, keyB, e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="focus-ring h-fit font-mono text-xs uppercase text-maroon"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="focus-ring rounded-sm border border-border px-3 py-1.5 font-mono text-xs uppercase text-navy"
      >
        + {addLabel}
      </button>
    </div>
  );
}
