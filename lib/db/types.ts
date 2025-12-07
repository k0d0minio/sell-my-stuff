export type ItemCategory = "clothes" | "decorations" | "furniture";

export interface Item {
	id: number;
	title: string;
	description: string;
	price: number;
	category: ItemCategory;
	images: string[];
	created_at: Date;
	updated_at: Date;
}

export interface Reservation {
	id: number;
	item_id: number;
	name: string;
	email: string;
	phone: string | null;
	preferred_contact: string | null;
	message: string;
	created_at: Date;
}

export interface ItemWithReservations extends Item {
	reservations?: Reservation[];
}

