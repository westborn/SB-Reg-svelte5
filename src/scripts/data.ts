type MockUser = {
	name: string;
	username: string;
};

export const mockArtistData: MockArtist[] = [
	{
		registrationId: 'Reg24-010',
		firstName: 'George',
		lastName: 'Stone',
		email: 'george@westborn.com.au',
		phone: '0412390110',
		postcode: '2551',
		bankAccountName: 'George',
		bankBSB: '123456',
		bankAccount: '14 15 16 17',
		firstNations: 'No'
	}
];

export const mockRegistrationData: MockRegistration[] = [
	{
		registrationId: 'Reg24-010',
		firstName: 'George',
		lastName: 'Stone',
		email: 'george@westborn.com.au',
		phone: '0412390110',
		postcode: '2551',
		bumpIn: 'Friday morning - until 12.00 pm 8 March',
		bumpOut: 'Monday morning 18 March',
		crane: 'No',
		displayRequirements: 'Pedestal ',
		bankAccountName: 'George',
		bankBSB: '123456',
		bankAccount: '14 15 16 17',
		transport: 'No',
		accommodation: 'No',
		confirmation: 'Complete',
		firstNations: 'No'
	}
];

export const mockEntryData: MockEntry[] = [
	{
		entryId: 'Entry24-013',
		registrationId: 'Reg24-010',
		inOrOut: 'Indoor',
		title: 'Reclaimed',
		material: 'Textile ',
		dimensions: '55x60x100',
		description: 'This piece shows that even something broken can sustain new life.',
		specialRequirements: 'Pedestal ',
		price: 3150
	}
];
export const mockImageData: MockImage[] = [
	{
		imageId: 'IMG24-013',
		entryId: 'Entry24-013',
		imageURL: 'https://drive.google.com/open?id=1Bc5P08me2FoAaJN1Yth808Cx0eGpSZaY',
		imageFileName: 'Voss_Reclaimed_IMG24-013',
		originalFileName: 'IMG_8079.jpeg'
	}
];
