import { Component } from '@angular/core';
import { Service } from '../../services/service';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// ---- Strongly-typed groups ----
type SpecGroup = FormGroup<{
  key: FormControl<string>;
  value: FormControl<string>;
}>;

type SizeGroup = FormGroup<{
  label: FormControl<string>;
  stock: FormControl<number>;
}>;

type VariantGroup = FormGroup<{
  color: FormControl<string>;
  images: FormArray<FormControl<string>>;
  sizes: FormArray<SizeGroup>;
}>;
@Component({
  selector: 'app-adminpage',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './adminpage.html',
  styleUrl: './adminpage.css',
})
export class Adminpage {
  msg = '';
  form: FormGroup;

  constructor(private fb: FormBuilder, private api: Service) {
    this.form = this.fb.group({
      // core
      name: ['', Validators.required],
      slug: ['', Validators.required],
      brand: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      category: [''],
      description: [''],

      // media
      image: [''],
      images: this.fb.array<FormControl<string>>([]),

      // meta
      tags: this.fb.array<FormControl<string>>([]),
      stock: [0],
      rating: [0],

      // specs (KV)
      specs: this.fb.array<SpecGroup>([]),

      // variants
      variants: this.fb.array<VariantGroup>([]),
    });
  }

  /* ---------- Arrays/Getters ---------- */
  get imagesFA() {
    return this.form.get('images') as FormArray<FormControl<string>>;
  }
  get tagsFA() {
    return this.form.get('tags') as FormArray<FormControl<string>>;
  }
  get specsFA() {
    return this.form.get('specs') as FormArray<SpecGroup>;
  }
  get variantsFA() {
    return this.form.get('variants') as FormArray<VariantGroup>;
  }

  // nested helpers so template never calls .get()
  imagesFAv(i: number) {
    return this.variantsFA.at(i).controls.images;
  } // FormArray<FormControl<string>>
  sizesFAv(i: number) {
    return this.variantsFA.at(i).controls.sizes;
  } // FormArray<SizeGroup>

  /* ---------- Images (gallery) ---------- */
  addImage(url = '') {
    this.imagesFA.push(this.fb.control(url, { nonNullable: true }));
  }
  removeImage(i: number) {
    this.imagesFA.removeAt(i);
  }

  /* ---------- Tags ---------- */
  addTag(v = '') {
    this.tagsFA.push(this.fb.control(v, { nonNullable: true }));
  }
  removeTag(i: number) {
    this.tagsFA.removeAt(i);
  }

  /* ---------- Specs (key/value) ---------- */
  addSpec(k = '', v = '') {
    this.specsFA.push(
      this.fb.group({
        key: this.fb.control(k, { nonNullable: true }),
        value: this.fb.control(v, { nonNullable: true }),
      }) as SpecGroup
    );
  }
  removeSpec(i: number) {
    this.specsFA.removeAt(i);
  }

  /* ---------- Variants ---------- */
  addVariant() {
    this.variantsFA.push(
      this.fb.group({
        color: this.fb.control('', { nonNullable: true }),
        images: this.fb.array<FormControl<string>>([]),
        sizes: this.fb.array<SizeGroup>([]),
      }) as VariantGroup
    );
  }
  removeVariant(i: number) {
    this.variantsFA.removeAt(i);
  }

  addVariantImage(vi: number, url = '') {
    this.imagesFAv(vi).push(this.fb.control(url, { nonNullable: true }));
  }
  removeVariantImage(vi: number, ii: number) {
    this.imagesFAv(vi).removeAt(ii);
  }

  addSize(vi: number, label = 'US 6', stock = 0) {
    this.sizesFAv(vi).push(
      this.fb.group({
        label: this.fb.control(label, { nonNullable: true }),
        stock: this.fb.control(stock, { nonNullable: true }),
      }) as SizeGroup
    );
  }
  removeSize(vi: number, si: number) {
    this.sizesFAv(vi).removeAt(si);
  }

  /* ---------- Submit ---------- */
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // specs -> object map
    const specsObj: Record<string, string> = {};
    for (const g of this.specsFA.controls) {
      const k = g.controls.key.value.trim();
      const v = g.controls.value.value.trim();
      if (k) specsObj[k] = v;
    }

    // clean arrays
    const images = this.imagesFA.value.map((s) => s.trim()).filter(Boolean);
    const tags = this.tagsFA.value.map((s) => s.trim()).filter(Boolean);

    // variants: ensure shapes are correct
    const variants = this.variantsFA.controls.map((v) => ({
      color: v.controls.color.value,
      images: v.controls.images.value.map((s) => s.trim()).filter(Boolean),
      sizes: v.controls.sizes.controls.map((sg) => ({
        label: sg.controls.label.value,
        stock: Number(sg.controls.stock.value ?? 0),
      })),
    }));

    const payload = {
      ...this.form.value,
      images,
      tags,
      specs: Object.keys(specsObj).length ? specsObj : undefined,
      variants,
    };

    this.api.createProduct(payload).subscribe({
      next: (p: any) => {
        this.msg = `Created: ${p.name}`;
        this.form.reset({ price: 0, stock: 0, rating: 0 });
        this.imagesFA.clear();
        this.tagsFA.clear();
        this.specsFA.clear();
        this.variantsFA.clear();
      },
      error: (e) => (this.msg = e?.error?.error || 'Failed to create product'),
    });
  }
}
