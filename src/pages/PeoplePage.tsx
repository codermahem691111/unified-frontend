import { useState } from 'react';
import { peopleApi } from '../api/peopleApi';
import { Alert } from '../components/Alert';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { Pagination } from '../components/Pagination';
import { PersonForm } from '../components/people/PersonForm';
import { SearchInput } from '../components/SearchInput';
import { usePagedList } from '../hooks/usePagedList';
import type { Person, PersonPayload, PersonType } from '../types/people';
import { PERSON_TYPES } from '../types/people';

type TypeFilter = PersonType | 'all';

/** `undefined` = closed, `null` = adding a new person, a Person = editing that person. */
type FormTarget = Person | null | undefined;

export function PeoplePage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [formTarget, setFormTarget] = useState<FormTarget>(undefined);
  const [deleting, setDeleting] = useState<Person | null>(null);

  const list = usePagedList<Person, { type?: PersonType }>({
    fetcher: (params) => peopleApi.list(params),
    filters: { type: typeFilter === 'all' ? undefined : typeFilter },
  });

  const handleSubmit = async (payload: PersonPayload) => {
    if (formTarget) {
      await peopleApi.update(formTarget.id, payload);
    } else {
      await peopleApi.create(payload);
    }
    setFormTarget(undefined);
    list.reload();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await peopleApi.remove(deleting.id);
    list.reload();
  };

  const typeLabel = (type: PersonType) => PERSON_TYPES.find((item) => item.value === type)?.label ?? type;
  const hasNoPeopleAtAll = !list.isLoading && list.total === 0 && !list.isSearching && typeFilter === 'all';

  return (
    <>
      <PageHeader
        title="People"
        subtitle="Your customers, staff and suppliers."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setFormTarget(null)}>
            Add person
          </button>
        }
      />

      <div className="toolbar">
        <div className="tabs" role="group" aria-label="Filter by type">
          <button
            type="button"
            className={`tabs__tab${typeFilter === 'all' ? ' tabs__tab--active' : ''}`}
            aria-pressed={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          >
            All
          </button>
          {PERSON_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              className={`tabs__tab${typeFilter === type.value ? ' tabs__tab--active' : ''}`}
              aria-pressed={typeFilter === type.value}
              onClick={() => setTypeFilter(type.value)}
            >
              {type.plural}
            </button>
          ))}
        </div>
        <SearchInput value={list.searchText} onChange={list.setSearchText} placeholder="Search by name, email or phone" />
      </div>

      {list.error && <Alert variant="error">{list.error}</Alert>}

      <section className="card">
        {hasNoPeopleAtAll ? (
          <EmptyState
            title="No people yet"
            message="Add your first customer, staff member or supplier."
            action={
              <button type="button" className="btn btn--primary" onClick={() => setFormTarget(null)}>
                Add person
              </button>
            }
          />
        ) : list.items.length === 0 && !list.isLoading ? (
          <EmptyState title="Nothing found" message="No one matches your search or filter." />
        ) : (
          <div className={`table-wrap${list.isLoading ? ' table-wrap--loading' : ''}`}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Details</th>
                  <th className="table__actions-head">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((person) => (
                  <tr key={person.id}>
                    <td data-label="Name">
                      <strong>{person.name}</strong>
                      {person.address && <div className="table__sub">{person.address}</div>}
                    </td>
                    <td data-label="Type">
                      <span className={`badge badge--${person.type}`}>{typeLabel(person.type)}</span>
                    </td>
                    <td data-label="Contact">
                      {person.email && <div>{person.email}</div>}
                      {person.phone && <div className="table__sub">{person.phone}</div>}
                      {!person.email && !person.phone && <span className="table__muted">—</span>}
                    </td>
                    <td data-label="Details" className="table__details">
                      {person.details ?? <span className="table__muted">—</span>}
                    </td>
                    <td className="table__actions">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setFormTarget(person)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => setDeleting(person)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
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
        title={formTarget ? 'Edit person' : 'Add person'}
        isOpen={formTarget !== undefined}
        onClose={() => setFormTarget(undefined)}
      >
        <PersonForm
          person={formTarget ?? null}
          defaultType={typeFilter === 'all' ? 'customer' : typeFilter}
          onSubmit={handleSubmit}
          onCancel={() => setFormTarget(undefined)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete person"
        message={`Delete ${deleting?.name ?? 'this person'}? This cannot be undone.`}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
