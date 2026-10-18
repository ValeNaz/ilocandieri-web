"use client";

import { useActionState, useState, useTransition, type FormEvent } from "react";
import { saveBlockAction } from "@/app/admin/(panel)/pagine/actions";
import { SaveBar } from "@/components/admin/SaveBar";
import { Button, Checkbox, Input, Select, Textarea } from "@/components/ui";
import type { ActionState } from "@/lib/actions";
import type { FieldSpec } from "@/lib/content/blocks";
import { CtaField } from "./CtaField";
import { HtmlField } from "./HtmlField";
import { MediaPicker, type MediaOption } from "./MediaPicker";

type Errors = Record<string, string> | undefined;
type Leaf = Exclude<FieldSpec, { kind: "items" }>;
type Values = Record<string, unknown>;

function Leaf({ f, prefix, values, media, errors }: { f: Leaf; prefix: string; values: Values; media: MediaOption[]; errors: Errors }) {
  const key = `${prefix}${f.name}`;
  const v = values?.[f.name];
  const err = errors?.[key];
  switch (f.kind) {
    case "text":
      return <Input label={f.label} name={key} defaultValue={String(v ?? "")} required={f.required} hint={f.hint} error={err} />;
    case "textarea":
      return <Textarea label={f.label} name={key} defaultValue={String(v ?? "")} rows={f.rows ?? 4} required={f.required} hint={f.hint} error={err} />;
    case "html":
      return <HtmlField name={key} label={f.label} defaultValue={String(v ?? "")} rows={f.rows} hint={f.hint} error={err} />;
    case "number":
      return <Input label={f.label} name={key} type="number" min={f.min} max={f.max} defaultValue={Number(v ?? f.min)} required hint={f.hint} error={err} className="max-w-32" />;
    case "select":
      return (
        <Select label={f.label} name={key} defaultValue={String(v ?? f.options[0]![0])} required hint={f.hint} error={err}>
          {f.options.map(([val, lab]) => <option key={val} value={val}>{lab}</option>)}
        </Select>
      );
    case "checkbox":
      return <Checkbox name={key} label={f.label} hint={f.hint} defaultChecked={Boolean(v)} error={err} />;
    case "media":
      return <MediaPicker name={key} label={f.label} defaultValue={(v as string | null) ?? null} options={media} hint={f.hint} error={err} />;
    case "cta":
      return <CtaField name={key} label={f.label} hint={f.hint} defaultValue={(v as { label: string; href: string } | null) ?? null} labelError={errors?.[`${key}.label`]} hrefError={errors?.[`${key}.href`]} />;
  }
}

function Items({ f, values, media, errors }: { f: Extract<FieldSpec, { kind: "items" }>; values: Values; media: MediaOption[]; errors: Errors }) {
  const initial = Array.isArray(values?.[f.name]) ? (values[f.name] as Values[]) : [];
  const [rows, setRows] = useState<{ k: number; v: Values }[]>(() => initial.map((v, k) => ({ k, v })));
  const [next, setNext] = useState(initial.length);
  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-medium">{f.label}</legend>
      {rows.map((r, idx) => (
        <div key={r.k} className="space-y-4 rounded-control border border-line bg-paper/50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink-soft">{f.itemLabel} {idx + 1}</p>
            <Button size="sm" variant="ghost" disabled={rows.length <= f.min} onClick={() => setRows((s) => s.filter((x) => x.k !== r.k))}>Rimuovi<span className="sr-only"> {f.itemLabel.toLowerCase()} {idx + 1}</span></Button>
          </div>
          {f.fields.map((sf) => <Leaf key={sf.name} f={sf} prefix={`${f.name}.${r.k}.`} values={r.v} media={media} errors={errors} />)}
        </div>
      ))}
      {rows.length < f.max && (
        <Button size="sm" variant="secondary" onClick={() => { setRows((s) => [...s, { k: next, v: {} }]); setNext((n) => n + 1); }}>Aggiungi {f.itemLabel.toLowerCase()}</Button>
      )}
      {errors?.[f.name] && <p role="alert" className="text-sm font-medium text-danger">{errors[f.name]}</p>}
    </fieldset>
  );
}

/**
 * Generic editor for one block. Submits through a transition (not the form `action` prop) so React does NOT
 * reset the fields when validation fails: the editor never loses typed text.
 */
export function BlockForm({ blockId, fields, values, media }: { blockId: string; fields: FieldSpec[]; values: Values; media: MediaOption[] }) {
  const [state, action] = useActionState<ActionState, FormData>(saveBlockAction, null);
  const [pending, start] = useTransition();
  const errors = state && !state.ok ? state.fieldErrors : undefined;
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(() => action(fd));
  };
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input type="hidden" name="id" value={blockId} />
      {fields.map((f) => (f.kind === "items" ? <Items key={f.name} f={f} values={values} media={media} errors={errors} /> : <Leaf key={f.name} f={f} prefix="" values={values} media={media} errors={errors} />))}
      <SaveBar state={state} sticky={false} extra={pending ? <span className="self-center text-sm text-ink-soft" role="status">Salvataggio in corso…</span> : undefined} />
    </form>
  );
}
