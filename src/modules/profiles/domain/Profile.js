// src/modules/profiles/domain/Profile.js
import { ProfileStatus } from './ProfileEnums';

export class Profile {
  constructor({ id, fullName, email, phone, association, role, status, avatarUrl }) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.phone = phone;
    this.association = association;
    this.role = role;
    this.status = status;
    this.avatarUrl = avatarUrl;
  }

  // Regla de negocio encapsulada
  get isActive() {
    return this.status === ProfileStatus.ACTIVE;
  }
}