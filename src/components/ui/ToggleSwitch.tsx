type ToggleSwitchProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
};

export default function ToggleSwitch({
    checked,
    onChange,
}: ToggleSwitchProps) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-accent" : "bg-on-secondary-container"
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-content-primary transition ${checked ? "translate-x-6" : "translate-x-1"
                    }`}
            />
        </button>
    );
}