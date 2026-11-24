// A labelled form control: <Field label="Title" name="title" />.
// as="textarea" or as="select" switches the element; other props go to the control.
export default function Field({
    label,
    as = "input",
    hint,
    children,
    ...props
}) {
    const Control = as;
    return (
        <label className="field">
            <span className="field-label">{label}</span>
            <Control className="control" {...props}>
                {children}
            </Control>
            {hint && <span className="field-hint">{hint}</span>}
        </label>
    );
}
