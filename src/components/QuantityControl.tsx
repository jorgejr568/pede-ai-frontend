import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

type QuantityControlProps = {
  value: number;
  onChange: (value: number) => void;
  allowZero?: boolean;
};

export const QuantityControl = ({
  value,
  onChange,
  allowZero,
}: QuantityControlProps) => {
  return (
    <div className="flex items-center justify-center select-none">
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1 && !allowZero}
      >
        {allowZero && value <= 1 ? (
          <TrashIcon className="h-4 w-4" />
        ) : (
          <MinusIcon className="h-4 w-4" />
        )}
        <span className="sr-only">Diminuir</span>
      </Button>
      <div className="mx-4 text-center">
        <div className="text-lg font-bold tracking-tighter select-none">
          {value}
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={() => onChange(value + 1)}
      >
        <PlusIcon className="h-4 w-4" />
        <span className="sr-only">Aumentar</span>
      </Button>
    </div>
  );
};
