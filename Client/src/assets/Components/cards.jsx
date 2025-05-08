import { NavLink } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench } from '@fortawesome/free-solid-svg-icons';

export function Cards({data}){
    return(
    <div className="">
        <div className="card h-100 border-0 shadow-sm mechanic-card">
          <div className="card-img-wrapper">
            <img
              src={data.imageURL}
              className="card-img-top img-fluid rounded-top"
              alt={data.fullName}
              loading="lazy"
            />
          </div>
          <div className="card-body p-4">
            <h5 className="card-title mb-2 text-primary">{data.fullName}</h5>
            <span className="badge bg-warning text-dark mb-3">{data.experience}</span>
            <span className="badge bg-success text-white mb-3">{data.location} <i className="fas fa-star"></i></span>
            <p className="card-text text-muted mb-4">{data.speciality}</p>
            <NavLink
              to={`/mechanic/${data.id}`}
              className="btn btn-primary btn-block w-100 fw-bold"
            >
              View Details
            </NavLink>
          </div>
        </div>

        <style jsx>{`
        .mechanic-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
        }

        .mechanic-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .card-img-wrapper {
          overflow: hidden;
          position: relative;
        }

        .card-img-top {
          object-fit: cover;
          height: 200px;
          transition: transform 0.3s ease;
        }

        .mechanic-card:hover .card-img-top {
          transform: scale(1.05);
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .badge {
          font-size: 0.9rem;
          padding: 0.5em 1em;
          border-radius: 20px;
        }

        .card-text {
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .btn-primary {
          border-radius: 8px;
          padding: 0.75rem;
          transition: background-color 0.3s ease;
        }

        .btn-primary:hover {
          background-color: #0052cc;
        }

        @media (max-width: 768px) {
          .card-img-top {
            height: 180px;
          }

          .card-title {
            font-size: 1.1rem;
          }
        }
      `}</style>

    </div>
    )
}


export function CardsPosts({data}) {
    return (
        <div className="">
        <div className="card h-100 border-0 shadow-sm mechanic-card">
            <div className="card-img-wrapper">
            <img
                src={data.
                    imgUrl
                    }
                className="card-img-top img-fluid rounded-top"
                alt="Mechanic Post"
                loading="lazy"
            />
            </div>
            <div className="card-body p-4">
            <h5 className="card-title mb-2 text-primary">{data.title}</h5>
            <span className="badge bg-warning text-dark mb-3"></span>
            <span className="badge bg-success text-white mb-3">Post by Mechanic: {data.Mechanic.fullName}</span>
            <p className="card-text text-muted mb-4">{data.content}</p>
            <NavLink to="/post-details" className="btn btn-primary btn-block w-100 fw-bold">
                View Details
            </NavLink>
            </div>
        </div>
        </div>
    );
}

export function CardsPackage({dataPackage}){
  return(
    <div className="">
    <div className="card h-100 border-0 shadow-sm package-card">
      <div className="card-img-wrapper position-relative">
        <img
          src={dataPackage.imgUrl || 'https://via.placeholder.com/300'}
          className="card-img-top img-fluid rounded-top"
          alt={dataPackage.namePackage || 'Package'}
          loading="lazy"
        />
        {dataPackage.discount && (
          <span className="discount-badge position-absolute top-0 start-0 m-3 badge bg-danger">
            {dataPackage.discount}% OFF
          </span>
        )}
      </div>
      <div className="card-body p-4">
        <h5 className="card-title mb-2 text-primary fw-bold">{dataPackage.namePackage || 'N/A'}</h5>
        <span
          className="badge bg-gradient-warning text-dark mb-3"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Price per package"
        >
          Rp {dataPackage.price?.toLocaleString('id-ID') || 'N/A'}
        </span>
        <p className="card-text text-muted mb-4 text-truncate" style={{ maxHeight: '4.5rem' }}>
          {dataPackage.description || 'No description available.'}
        </p>
        <NavLink
          to={`/order`}
          state={{ packageData: dataPackage }}
          className="btn btn-primary w-100 py-2 fw-bold"
        >
          <FontAwesomeIcon icon={faWrench} className="me-2" />
          Book Now
        </NavLink>
      </div>
    </div>
  </div>
  )
}
