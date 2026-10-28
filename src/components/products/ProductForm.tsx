import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { ApiError } from '../../api/apiError';
import type { ImageChange, Product, ProductPayload } from '../../types/products';
import { checkImageFile, type ProductFormValues, validateProduct } from '../../utils/resourceValidators';
import type { FieldErrors } from '../../utils/validators';
import { Alert } from '../Alert';
import { FormActions } from '../FormActions';
import { FormField } from '../FormField';

interface ProductFormProps {
  /** The product being edited, or null when adding a new one. */
  product: Product | null;
  onSubmit: (payload: ProductPayload, image: ImageChange) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>({
    name: product?.name ?? '',
    details: product?.details ?? '',
    sellingPrice: product ? String(product.sellingPrice) : '',
    buyingPrice: product ? String(product.buyingPrice) : '',
  });
  const [errors, setErrors] = useState<FieldErrors<ProductFormValues>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show a preview of the chosen file, and free the browser memory when it changes.
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    const problem = file ? checkImageFile(file) : null;

    setImageError(problem);
    setImageFile(problem ? null : file);
    if (file && !problem) setRemoveImage(false);
    if (problem) event.target.value = '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateProduct(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerErrors([]);

    try {
      await onSubmit(
        {
          name: values.name.trim(),
          details: values.details.trim() === '' ? null : values.details.trim(),
          sellingPrice: Number(values.sellingPrice),
          buyingPrice: Number(values.buyingPrice),
        },
        { file: imageFile, remove: removeImage },
      );
    } catch (caught) {
      setServerErrors(ApiError.from(caught).messages);
      setIsSubmitting(false);
    }
  };

  const fieldProps = (name: keyof ProductFormValues, id: string) => ({
    id,
    name,
    value: values[name],
    onChange: handleChange,
    className: `input${errors[name] ? ' input--invalid' : ''}`,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${id}-error` : undefined,
  });

  const shownImage = previewUrl ?? (removeImage ? null : (product?.imageUrl ?? null));

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="modal__body form">
        {serverErrors.length > 0 && (
          <Alert variant="error">
            {serverErrors.map((message) => (
              <div key={message}>{message}</div>
            ))}
          </Alert>
        )}

        <FormField label="Product name" htmlFor="product-name" error={errors.name}>
          <input {...fieldProps('name', 'product-name')} type="text" autoComplete="off" />
        </FormField>

        <FormField label="Details (optional)" htmlFor="product-details" error={errors.details}>
          <textarea {...fieldProps('details', 'product-details')} rows={3} />
        </FormField>

        <div className="form__row">
          <FormField label="Selling price" htmlFor="product-selling" error={errors.sellingPrice}>
            <input {...fieldProps('sellingPrice', 'product-selling')} type="number" inputMode="decimal" min="0" step="0.01" />
          </FormField>

          <FormField label="Buying price" htmlFor="product-buying" error={errors.buyingPrice}>
            <input {...fieldProps('buyingPrice', 'product-buying')} type="number" inputMode="decimal" min="0" step="0.01" />
          </FormField>
        </div>

        <FormField label="Product image (optional)" htmlFor="product-image" error={imageError ?? undefined} hint="JPEG, PNG or WebP, up to 2 MB.">
          <div className="image-field">
            {shownImage ? (
              <img className="image-field__preview" src={shownImage} alt="Product preview" />
            ) : (
              <div className="image-field__placeholder" aria-hidden="true">
                No image
              </div>
            )}
            <div className="image-field__controls">
              <input
                id="product-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                aria-invalid={Boolean(imageError)}
                aria-describedby={imageError ? 'product-image-error' : undefined}
              />
              {product?.imageUrl && !imageFile && (
                <label className="checkbox">
                  <input type="checkbox" checked={removeImage} onChange={(event) => setRemoveImage(event.target.checked)} />
                  Remove current image
                </label>
              )}
            </div>
          </div>
        </FormField>
      </div>

      <FormActions isSubmitting={isSubmitting} submitLabel={product ? 'Save changes' : 'Add product'} onCancel={onCancel} />
    </form>
  );
}
