UPDATE connect
SET title = :title,
    description = :description,
    address = :address,
    phone = :phone,
    fax = :fax,
    email = :email,
    hours = :hours,
    updated_at = now()
RETURNING updated_at;
