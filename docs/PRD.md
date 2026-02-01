# Sculpture Bermagui Registration System - Product Requirements Document

## Product Vision

Enable artists to seamlessly register and manage their artwork submissions for the annual Sculpture Bermagui exhibition, while providing administrators with efficient tools to manage the exhibition lifecycle from registration through to installation.

## Product Goals

1. **Simplify Registration**: Reduce friction in the artist registration and submission process
2. **Ensure Data Integrity**: Maintain accurate records of artists, artworks, and exhibition logistics
3. **Enable Self-Service**: Allow artists to manage their own submissions independently
4. **Support Administration**: Provide administrators with powerful tools for exhibition management
5. **Scale Annually**: Support recurring exhibitions without data loss or manual migration

## User Personas

### Primary Artist

- **Profile**: Visual artist submitting sculpture work for exhibition consideration
- **Technical Level**: Varies widely (some tech-savvy, some not)
- **Goals**:
  - Register quickly and easily
  - Submit high-quality images of their work
  - Update their submission before deadline
  - Track acceptance status
- **Pain Points**:
  - Confusion about requirements
  - Difficulty uploading images
  - Concerns about pricing their work

### Returning Artist

- **Profile**: Artist who has participated in previous years
- **Technical Level**: Familiar with the system
- **Goals**:
  - Reuse existing profile information
  - Submit new entries efficiently
  - View historical submissions
- **Pain Points**:
  - Having to re-enter unchanged information
  - Remembering what they submitted previously

### Exhibition Administrator

- **Profile**: Volunteer or staff managing the exhibition
- **Technical Level**: Moderate to high
- **Goals**:
  - Review all submissions efficiently
  - Manage acceptance decisions
  - Assign exhibit locations
  - Communicate with artists
- **Pain Points**:
  - Time-consuming manual processes
  - Difficulty tracking incomplete submissions
  - Managing artists who need assistance

### Super Administrator

- **Profile**: Technical staff or organizers with full system access
- **Technical Level**: High
- **Goals**:
  - Assist artists with technical issues
  - Perform bulk operations
  - Maintain data integrity
  - Generate reports
- **Pain Points**:
  - Needing to log in as different users
  - Manual data corrections

## Core User Journeys

### Journey 1: First-Time Artist Registration

1. Artist receives email invitation with registration link
2. Artist creates account via email authentication
3. Artist completes profile (name, contact, banking, First Nations status)
4. Artist creates artwork entry with details
5. Artist uploads 1-3 images per entry
6. Artist designates primary image for each entry
7. Artist reviews and confirms submission
8. System sends confirmation email

**Success Criteria**: Artist completes registration in < 15 minutes without assistance

### Journey 2: Returning Artist Submission

1. Artist logs in with existing account
2. System pre-fills profile information
3. Artist updates any changed details
4. Artist creates new entries for current year
5. Artist reuses or uploads new images
6. Artist confirms submission
7. System sends confirmation

**Success Criteria**: Artist completes registration in < 10 minutes

### Journey 3: Administrator Review & Acceptance

1. Administrator logs in to admin panel
2. Views list of all submissions for current year
3. Reviews artwork details and images
4. Marks entries as accepted/declined
5. Assigns exhibit numbers to accepted works
6. Assigns physical locations
7. System notifies artists of acceptance status

**Success Criteria**: Administrator can process 50+ submissions efficiently

### Journey 4: Artist Manages Images

1. Artist navigates to existing entry
2. Views current images with primary designation
3. Uploads additional images (up to limit)
4. Removes unwanted images
5. Designates different image as primary
6. System updates immediately

**Success Criteria**: Image management is intuitive without instructions

## Functional Requirements

### Registration Management

- [ ] Support annual registration cycles with configurable exhibition year
- [ ] Allow artists to register once and submit multiple entries
- [ ] Enable registration period open/close controls
- [ ] Track registration completion status
- [ ] Support both indoor and outdoor entry types

### Artist Profile

- [ ] Store essential artist information (name, email, phone, location)
- [ ] Support First Nations identification with privacy option
- [ ] Collect banking details for artwork sales
- [ ] Allow profile updates throughout registration period

### Artwork Entry

- [ ] Support multiple entries per artist
- [ ] Require title, entry type, and pricing
- [ ] Collect optional fields: materials, dimensions, description, special requirements
- [ ] Limit description to 30 words
- [ ] Enable entry for major prize consideration
- [ ] Allow entry updates before registration close

### Image Management

- [ ] Support 1-3 images per entry (UI limit)
- [ ] Allow image upload from common formats (JPEG, PNG, WebP, HEIC)
- [ ] Enforce 5MB file size limit
- [ ] Designate one primary image per entry
- [ ] Support image reordering and replacement
- [ ] Maintain minimum 1 image per entry

### Exhibition Logistics

- [ ] Collect bump-in/bump-out preferences
- [ ] Track accommodation, crane, and transport needs
- [ ] Allow special display requirements

### Administrative Functions

- [ ] View all registrations for current year
- [ ] Filter and search submissions
- [ ] Accept/decline entries
- [ ] Assign exhibit numbers and locations
- [ ] Proxy as artist to provide support (super admin only)
- [ ] Generate exhibition reports

## Non-Functional Requirements

### Performance

- Image uploads complete in < 30 seconds on average connection
- Page loads in < 2 seconds
- Support 100+ concurrent users during registration period

### Security

- Email-based authentication with secure tokens
- Role-based access control (Artist, Admin, Super Admin)
- Banking information stored securely
- HTTPS for all connections

### Reliability

- 99.5% uptime during registration periods
- Database backups daily
- Graceful error handling with user-friendly messages

### Usability

- Mobile-responsive design
- Accessible to WCAG 2.1 AA standards
- Clear error messages and validation
- Consistent UI across all pages

### Maintainability

- Type-safe codebase with TypeScript
- Automated database migrations
- Comprehensive error logging
- Documentation for all major features

## Out of Scope (For Current Version)

- Artist portfolio pages or galleries
- Public voting or judging system
- Online payment processing for registration fees
- Email marketing and campaign management
- Mobile native applications
- Multi-language support
- Real-time collaboration features
- Integration with third-party ticketing systems

## Success Metrics

### User Adoption

- 90%+ of invited artists complete registration
- < 5% require administrator assistance
- 80%+ returning artist rate year-over-year

### System Performance

- < 2% error rate during registration period
- Average registration completion time < 15 minutes
- Zero data loss incidents

### Business Impact

- 30% reduction in administrative time vs. previous system
- 100% accurate artist and artwork data
- Improved artist satisfaction (measured via survey)

## Future Enhancements

### Phase 2 (Next Exhibition)

- Email notifications for registration status changes
- Artist dashboard with submission history
- Batch operations for administrators
- Advanced search and filtering

### Phase 3 (Future)

- Public gallery of accepted works
- QR code generation for exhibit labels
- Sales tracking and payment processing
- Artist analytics and insights

### Phase 4 (Long-term)

- Mobile applications (iOS/Android)
- Integration with exhibition website
- Community features (comments, likes)
- Multi-exhibition support for other organizations

## Technical Constraints

- Must support modern browsers (last 2 versions)
- Must work on mobile devices (iOS Safari, Android Chrome)
- Must integrate with existing Cloudinary account
- Must use PostgreSQL database
- Must support HEIC image format
- Database must support cascade deletion for data integrity

## Assumptions

1. Artists have reliable internet access
2. Artists can receive and access email
3. Exhibition dates are known 6+ months in advance
4. Registration period is 2-4 weeks minimum
5. Administrators have basic technical skills
6. Budget allows for Cloudinary and hosting costs

## Dependencies

- Supabase for authentication
- Cloudinary for image hosting
- Email service (Gmail) for notifications
- PostgreSQL database hosting
- Web hosting with Node.js support

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Owner**: Sculpture Bermagui Technical Team  
**Review Cycle**: Annually after each exhibition
