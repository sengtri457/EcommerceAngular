import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Service } from '../../services/service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
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
  selector: 'app-admin-update',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-update.html',
  styleUrl: './admin-update.css',
})
export class AdminUpdate implements OnInit {
  id = '';
  msg = '';
  loading = true;
  saving = false;
  form!: FormGroup;

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

  constructor(
    private fb: FormBuilder,
    private api: Service,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      brand: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      category: [''],
      description: [''],
      image: [''],
      images: this.fb.array<FormControl<string>>([]),
      tags: this.fb.array<FormControl<string>>([]),
      rating: [0],
      specs: this.fb.array<SpecGroup>([]),
      variants: this.fb.array<VariantGroup>([]),
    });
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  private pushSpec(k = '', v = '') {
    this.specsFA.push(
      this.fb.group({
        key: this.fb.control(k, { nonNullable: true }),
        value: this.fb.control(v, { nonNullable: true }),
      }) as SpecGroup
    );
  }
  private pushVariant(v?: any) {
    const vg = this.fb.group({
      color: this.fb.control(v?.color || '', { nonNullable: true }),
      images: this.fb.array<FormControl<string>>([]),
      sizes: this.fb.array<SizeGroup>([]),
    }) as VariantGroup;
    (v?.images || []).forEach((url: string) =>
      vg.controls.images.push(this.fb.control(url, { nonNullable: true }))
    );
    (v?.sizes || []).forEach((s: any) =>
      vg.controls.sizes.push(
        this.fb.group({
          label: this.fb.control(s.label || '', { nonNullable: true }),
          stock: this.fb.control(Number(s.stock ?? 0), { nonNullable: true }),
        }) as SizeGroup
      )
    );
    this.variantsFA.push(vg);
  }

  load() {
    this.loading = true;
    this.api
      .getProduct(this.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((p) => {
        // simple fields
        this.form.patchValue({
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          price: p.price,
          category: p.category,
          description: p.description,
          image: p.image,
          rating: p.rating ?? 0,
        });

        // arrays
        this.imagesFA.clear();
        (p.images || []).forEach((u: string) =>
          this.imagesFA.push(this.fb.control(u, { nonNullable: true }))
        );
        this.tagsFA.clear();
        (p.tags || []).forEach((t: string) =>
          this.tagsFA.push(this.fb.control(t, { nonNullable: true }))
        );

        // specs (Map → pairs)
        this.specsFA.clear();
        if (p.specs)
          Object.entries(p.specs).forEach(([k, v]: any) =>
            this.pushSpec(k, String(v))
          );

        // variants
        this.variantsFA.clear();
        (p.variants || []).forEach((v: any) => this.pushVariant(v));
      });
  }

  addImage() {
    this.imagesFA.push(this.fb.control('', { nonNullable: true }));
  }
  removeImage(i: number) {
    this.imagesFA.removeAt(i);
  }
  addTag() {
    this.tagsFA.push(this.fb.control('', { nonNullable: true }));
  }
  removeTag(i: number) {
    this.tagsFA.removeAt(i);
  }
  addSpec() {
    this.pushSpec('', '');
  }
  removeSpec(i: number) {
    this.specsFA.removeAt(i);
  }

  addVariant() {
    this.pushVariant({});
  }
  removeVariant(i: number) {
    this.variantsFA.removeAt(i);
  }

  imagesFAv(i: number) {
    return this.variantsFA.at(i).controls.images;
  }
  sizesFAv(i: number) {
    return this.variantsFA.at(i).controls.sizes;
  }
  addVariantImage(vi: number) {
    this.imagesFAv(vi).push(this.fb.control('', { nonNullable: true }));
  }
  removeVariantImage(vi: number, ii: number) {
    this.imagesFAv(vi).removeAt(ii);
  }
  addSize(vi: number) {
    this.sizesFAv(vi).push(
      this.fb.group({
        label: this.fb.control('US 6', { nonNullable: true }),
        stock: this.fb.control(0, { nonNullable: true }),
      }) as SizeGroup
    );
  }
  removeSize(vi: number, si: number) {
    this.sizesFAv(vi).removeAt(si);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;

    // build specs map
    const specs: Record<string, string> = {};
    this.specsFA.controls.forEach((g) => {
      const k = g.controls.key.value.trim(),
        v = g.controls.value.value.trim();
      if (k) specs[k] = v;
    });

    const payload = {
      ...this.form.value,
      images: this.imagesFA.value.map((s) => s.trim()).filter(Boolean),
      tags: this.tagsFA.value.map((s) => s.trim()).filter(Boolean),
      specs: Object.keys(specs).length ? specs : undefined,
      variants: this.variantsFA.controls.map((v) => ({
        color: v.controls.color.value,
        images: v.controls.images.value.map((s) => s.trim()).filter(Boolean),
        sizes: v.controls.sizes.controls.map((sg) => ({
          label: sg.controls.label.value,
          stock: Number(sg.controls.stock.value ?? 0),
        })),
      })),
    };

    this.api
      .updateProduct(this.id, payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.msg = '✅ Updated';
          // Option A: navigate back to list
          // this.router.navigate(['/admin/products']);
          // Option B: stay and refresh the form with saved data
          this.load();
        },
        error: (e) => (this.msg = e?.error?.error || 'Failed to update'),
      });
  }
}
