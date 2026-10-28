import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../hooks/useAuth';

const SERVICES = [
  {
    to: '/people',
    title: 'People management',
    text: 'Keep your customers, staff and suppliers in one place.',
  },
  {
    to: '/products',
    title: 'Product management',
    text: 'Products with details, selling and buying prices, and pictures.',
  },
  {
    to: '/finance',
    title: 'Finance management',
    text: 'Record income and expenses and see your growth on a graph.',
  },
];

export function DashboardPage() {
  const { company } = useAuth();

  if (!company) return null;

  const registeredOn = new Date(company.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <PageHeader title={company.companyName} subtitle={`Welcome, ${company.ownerName}. Choose a service to get started.`} />

      <div className="service-grid">
        {SERVICES.map((service) => (
          <Link key={service.to} to={service.to} className="service-card">
            <h2 className="service-card__title">{service.title}</h2>
            <p className="service-card__text">{service.text}</p>
            <span className="service-card__cta">Open →</span>
          </Link>
        ))}
      </div>

      <section className="card card--padded">
        <h2 className="card__title">Company details</h2>
        <dl className="details">
          <div>
            <dt>Owner</dt>
            <dd>{company.ownerName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{company.email}</dd>
          </div>
          <div>
            <dt>License number</dt>
            <dd>{company.licenseNumber}</dd>
          </div>
          <div>
            <dt>Registered</dt>
            <dd>{registeredOn}</dd>
          </div>
          <div className="details__wide">
            <dt>Business description</dt>
            <dd>{company.businessDescription}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
