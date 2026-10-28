import { useState } from 'react';
import { ApiError } from '../api/apiError';
import { productsApi } from '../api/productsApi';
import { Alert } from '../components/Alert';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { ProductForm } from '../components/products/ProductForm';
import { SearchInput } from '../components/SearchInput';
import { usePagedList } from '../hooks/usePagedList';
import type { ImageChange, Product, ProductPayload } from '../types/products';
import { formatMoney } from '../utils/format';

/** `undefined` = closed, `null` = adding a new product, a Product = editing that product. */
type FormTarget = Product | null | undefined;

export function ProductsPage() {
  const [formTarget, setFormTarget] = useState<FormTarget>(undefined);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const list = usePagedList<Product>({
    fetcher: (params) => productsApi.list(params),
    filters: {},
  });

  const handleSubmit = async (payload: ProductPayload, image: ImageChange) => {
    setNotice(null);

    const saved = formTarget ? await productsApi.update(formTarget.id, payload) : await productsApi.create(payload);

    // The product itself is saved. If only the picture fails, close the form and say so,
    // instead of leaving the form open (retrying would create a duplicate product).
    try {
      if (image.file) {
        await productsApi.uploadImage(saved.id, image.file);
      } else if (image.remove && formTarget?.imageUrl) {
        await productsApi.removeImage(saved.id);
      }
    } catch (caught) {
      setNotice(
        `“${saved.name}” was saved, but its image could not be updated: ${ApiError.from(caught).message} Edit the product to try again.`,
      );
    }

    setFormTarget(undefined);
    list.reload();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await productsApi.remove(deleting.id);
    list.reload();
  };

  const hasNoProductsAtAll = !list.isLoading && list.total === 0 && !list.isSearching;

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="What you sell, with prices and pictures."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setFormTarget(null)}>
            Add product
          </button>
        }
      />

      <div className="toolbar">
        <SearchInput value={list.searchText} onChange={list.setSearchText} placeholder="Search products by name" />
      </div>

      {list.error && <Alert variant="error">{list.error}</Alert>}
      {notice && <Alert variant="info">{notice}</Alert>}

      <section className="card">
        {hasNoProductsAtAll ? (
          <EmptyState
            title="No products yet"
            message="Add your first product with its selling and buying price."
            action={
              <button type="button" className="btn btn--primary" onClick={() => setFormTarget(null)}>
                Add product
              </button>
            }
          />
        ) : list.items.length === 0 && !list.isLoading ? (
          <EmptyState title="Nothing found" message="No product matches your search." />
        ) : (
          <div className={`table-wrap${list.isLoading ? ' table-wrap--loading' : ''}`}>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <span className="sr-only">Image</span>
                  </th>
                  <th>Product</th>
                  <th className="table__number">Selling price</th>
                  <th className="table__number">Buying price</th>
                  <th className="table__number">Margin</th>
                  <th className="table__actions-head">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((product) => {
                  const margin = product.sellingPrice - product.buyingPrice;
                  return (
                    <tr key={product.id}>
                      <td className="table__image-cell">
                        {product.imageUrl ? (
                          <img className="thumb" src={product.imageUrl} alt={product.name} loading="lazy" />
                        ) : (
                          <div className="thumb thumb--empty" aria-hidden="true">
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td data-label="Product">
                        <strong>{product.name}</strong>
                        {product.details && <div className="table__sub table__details">{product.details}</div>}
                      </td>
                      <td data-label="Selling price" className="table__number">
                        {formatMoney(product.sellingPrice)}
                      </td>
                      <td data-label="Buying price" className="table__number">
                        {formatMoney(product.buyingPrice)}
                      </td>
                      <td data-label="Margin" className={`table__number ${margin < 0 ? 'text-negative' : ''}`}>
                        {formatMoney(margin)}
                      </td>
                      <td className="table__actions">
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setFormTarget(product)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => setDeleting(product)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          pageSize={list.pageSize}
          onPageChange={list.setPage}
        />
      </section>

      <Modal
        title={formTarget ? 'Edit product' : 'Add product'}
        isOpen={formTarget !== undefined}
        onClose={() => setFormTarget(undefined)}
      >
        <ProductForm product={formTarget ?? null} onSubmit={handleSubmit} onCancel={() => setFormTarget(undefined)} />
      </Modal>

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete product"
        message={`Delete ${deleting?.name ?? 'this product'}? Its image is deleted too. This cannot be undone.`}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
