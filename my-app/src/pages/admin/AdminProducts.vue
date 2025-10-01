<template>
  <div class="admin-products-page">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h3 class="fw-bold mb-0 d-flex align-items-center gap-2">
        <i class="bi bi-box-seam"></i>
        Admin Products
      </h3>

      <div class="d-flex align-items-center gap-2">
        <div class="input-group d-none d-md-flex">
          <span class="input-group-text bg-white border-end-0">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model.trim="q"
            type="search"
            class="form-control border-start-0"
            placeholder="Search products..."
            @keydown.enter.prevent
          />
        </div>

        <button
          type="button"
          class="btn btn-primary d-flex align-items-center gap-2"
          @click="openForm()"
        >
          <i class="bi bi-plus-lg"></i>
          Add Product
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="card shadow-sm border-0">
      <div class="card-body">
        <div v-if="loading" class="py-5 text-center text-muted">
          <div class="spinner-border mb-2"></div>
          <div>Loading products…</div>
        </div>

        <template v-else>
          <!-- Empty state -->
          <div v-if="filteredProducts.length === 0" class="py-5 text-center text-muted">
            <i class="bi bi-box" style="font-size: 1.6rem"></i>
            <div class="mt-2">No products found</div>
          </div>

          <!-- Grid -->
          <div class="row g-3">
            <div
              class="col-12 col-sm-6 col-lg-4 col-xl-3"
              v-for="p in filteredProducts"
              :key="p.id"
            >
              <div class="product-card h-100 border rounded-3 overflow-hidden">
                <!-- SLIDER / SINGLE IMAGE -->
                <div
                  class="ratio ratio-4x3 position-relative slider-touch slider-card"
                  @touchstart.passive="onTouchStart($event, p.id)"
                  @touchmove.passive="onTouchMove"
                  @touchend="onTouchEnd(p)"
                  @mousedown.left="onMouseDown($event, p.id)"
                  @mousemove="onMouseMove"
                  @mouseup="onMouseUp(p)"
                  @mouseleave="onMouseLeave"
                >
                  <!-- MULTI-IMAGE -->
                  <template v-if="p.product_url.length > 1">
                    <transition :name="slideName(p.id)" mode="out-in">
                      <img
                        :key="currentIndex(p.id)"
                        :src="imageUrlAt(p, currentIndex(p.id))"
                        :alt="p.name"
                        class="w-100 h-100 object-fit-cover"
                        :style="swipeStyle(p.id)"
                        draggable="false"
                      />
                    </transition>

                    <!-- arrows -->
                    <button class="slider-btn left" @click="prev(p.id)" aria-label="Previous image">
                      <i class="bi bi-chevron-left"></i>
                    </button>
                    <button class="slider-btn right" @click="next(p)" aria-label="Next image">
                      <i class="bi bi-chevron-right"></i>
                    </button>

                    <!-- dots (below) -->
                    <div class="slider-dots slider-dots-below">
                      <button
                        v-for="(u, i) in p.product_url"
                        :key="i"
                        class="dot"
                        :class="{ active: currentIndex(p.id) === i }"
                        @click="setIndex(p.id, i)"
                        :aria-label="`Go to image ${i + 1}`"
                      />
                    </div>
                  </template>

                  <!-- SINGLE IMAGE -->
                  <template v-else>
                    <template v-if="imageUrlAt(p, 0)">
                      <transition :name="slideName(p.id)" mode="out-in">
                        <img
                          :key="'single-' + p.id"
                          :src="imageUrlAt(p, 0)"
                          :alt="p.name"
                          class="w-100 h-100 object-fit-cover"
                          draggable="false"
                        />
                      </transition>
                    </template>
                    <template v-else>
                      <div
                        class="d-flex flex-column align-items-center justify-content-center text-muted"
                        style="inset: 0; position: absolute"
                      >
                        <i class="bi bi-image" style="font-size: 1.6rem"></i>
                        <small class="mt-1">No image</small>
                      </div>
                    </template>
                  </template>

                  <span
                    v-if="isAnyImgBusy(p)"
                    class="position-absolute top-0 end-0 m-2 badge text-bg-secondary"
                  >
                    loading…
                  </span>
                </div>

                <!-- Body -->
                <div class="p-3">
                  <div class="d-flex justify-content-between align-items-start gap-2">
                    <strong class="text-truncate">{{ p.name }}</strong>
                    <span class="badge text-bg-primary">₱ {{ number(p.price) }}</span>
                  </div>
                  <div class="text-muted small mt-1" :title="p.description || ''">
                    {{ p.description || '—' }}
                  </div>

                  <div class="text-muted xsmall mt-1">
                    <i class="bi bi-tag me-1"></i>Supplier: ₱ {{ number(p.supplier_price) }}
                  </div>

                  <div
                    class="d-flex justify-content-between align-items-center mt-3 small text-muted"
                  >
                    <span><i class="bi bi-calendar-plus me-1"></i>{{ fmt(p.created_at) }}</span>
                    <span><i class="bi bi-clock-history me-1"></i>{{ fmt(p.updated_at) }}</span>
                  </div>

                  <!-- Publish switch + actions -->
                  <div class="d-flex align-items-center justify-content-between mt-3">
                    <div class="form-check form-switch m-0">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        :id="`pub-${p.id}`"
                        :checked="p.ispublish"
                        @change="togglePublish(p)"
                      />
                      <label class="form-check-label small" :for="`pub-${p.id}`">
                        {{ p.ispublish ? 'Published' : 'Unpublished' }}
                      </label>
                    </div>

                    <div class="d-flex gap-2" v-if="!p.ispublish">
                      <button class="btn btn-sm btn-outline-secondary" @click="openEdit(p)">
                        <i class="bi bi-pencil-square me-1"></i>Edit
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="deleteProduct(p)">
                        <i class="bi bi-trash me-1"></i>Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Minimal footer -->
          <div class="d-flex justify-content-end mt-3 small text-muted">
            <span>Total: {{ products.length }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Create Product Modal -->
    <div v-if="showForm" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg">
        <div class="card-header d-flex justify-content-between align-items-center">
          <strong>Add Product</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeForm">✕</button>
        </div>

        <div class="card-body">
          <form @submit.prevent="submit">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Name</label>
                <input
                  v-model.trim="form.name"
                  type="text"
                  class="form-control"
                  placeholder="USB Drive"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Price (₱)</label>
                <input
                  v-model.number="form.price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Supplier Price (₱)</label>
                <input
                  v-model.number="form.supplier_price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  :class="{ 'is-invalid': !supplierOk }"
                  required
                />
                <div class="invalid-feedback">Supplier price must be &lt; Price and ≥ 0.</div>
                <div class="form-text" v-if="supplierOk">
                  Must be strictly lower than the selling price.
                </div>
              </div>

              <div class="col-md-6">
                <label class="form-label">Image Source</label>
                <div class="btn-group w-100">
                  <button
                    type="button"
                    class="btn"
                    :class="formMode === 'upload' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="formMode = 'upload'"
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="formMode === 'url' ? 'btn-primary' : 'btn-outline-primary'"
                    @click="formMode = 'url'"
                  >
                    Paste URL(s)
                  </button>
                </div>
                <div class="form-text">Up to 5 images total.</div>
              </div>

              <!-- FACEBOOK-LIKE UPLOADER -->
              <div class="col-12" v-if="formMode === 'upload'">
                <label class="form-label">Upload Picture(s)</label>

                <!-- drag & drop zone -->
                <div
                  class="fb-dropzone"
                  :class="{ 'drag-over': draggingOver }"
                  @dragover.prevent="onDragOver"
                  @dragleave.prevent="onDragLeave"
                  @drop.prevent="onDrop"
                >
                  <div class="text-center text-muted">
                    <i class="bi bi-images" style="font-size: 1.6rem"></i>
                    <div class="mt-2">Drag photos here or</div>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-primary mt-2"
                      @click="triggerFile"
                    >
                      Browse files
                    </button>
                    <div class="small mt-2">Max 5 images</div>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="d-none"
                    multiple
                    @change="onFiles"
                  />
                </div>

                <!-- preview grid -->
                <div v-if="filePreviews.length" class="preview-grid mt-3">
                  <div class="preview-item" v-for="(p, i) in filePreviews" :key="p.key">
                    <img :src="p.url" alt="" />
                    <div class="preview-actions">
                      <button
                        type="button"
                        class="btn btn-sm btn-light"
                        @click="moveUp(i)"
                        :disabled="i === 0"
                        title="Move up"
                      >
                        <i class="bi bi-arrow-up"></i>
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-light"
                        @click="moveDown(i)"
                        :disabled="i === filePreviews.length - 1"
                        title="Move down"
                      >
                        <i class="bi bi-arrow-down"></i>
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm btn-danger"
                        @click="removeAt(i)"
                        title="Remove"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- URL MODE WITH PREVIEW -->
              <div class="col-12" v-else>
                <label class="form-label">Picture URL(s)</label>
                <div class="d-grid gap-2">
                  <div
                    v-for="(u, i) in form.product_urls"
                    :key="i"
                    class="d-flex gap-2 align-items-center"
                  >
                    <input
                      v-model.trim="form.product_urls[i]"
                      type="url"
                      class="form-control"
                      :placeholder="`https://…/image_${i + 1}.jpg`"
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary btn-sm"
                      @click="previewUrl(i)"
                      title="Preview"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-danger btn-sm"
                      @click="removeUrl(i)"
                      title="Remove"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
                <div class="d-flex justify-content-between mt-2">
                  <small class="text-muted">Add up to 5 direct image URLs.</small>
                  <div class="d-flex gap-2">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      @click="addUrlField"
                      :disabled="form.product_urls.length >= 5"
                    >
                      + Add URL
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      @click="trimEmptyUrls"
                    >
                      Clean empties
                    </button>
                  </div>
                </div>

                <!-- url previews -->
                <div v-if="urlPreviews.length" class="preview-grid mt-3">
                  <div class="preview-item" v-for="(p, i) in urlPreviews" :key="p.key">
                    <img :src="p.url" alt="" />
                  </div>
                </div>
              </div>

              <div class="col-12">
                <label class="form-label">Description (optional)</label>
                <textarea
                  v-model.trim="form.description"
                  rows="3"
                  class="form-control"
                  placeholder="Short description…"
                ></textarea>
              </div>

              <div class="col-md-6">
                <label class="form-label">Warranty (optional)</label>
                <input
                  v-model.trim="form.warranty"
                  type="text"
                  class="form-control"
                  placeholder="12 months parts & labor"
                />
              </div>

              <!-- ===== Friendly Specifications Editor (Create) ===== -->
              <div class="col-12">
                <label class="form-label mb-2">Specifications (optional)</label>

                <!-- Rows -->
                <div class="spec-rows">
                  <div class="spec-row" v-for="(row, i) in form.specList" :key="row._key">
                    <input
                      v-model.trim="row.key"
                      type="text"
                      class="form-control"
                      placeholder="Key (e.g., Brand)"
                      aria-label="Specification key"
                    />
                    <input
                      v-model.trim="row.value"
                      type="text"
                      class="form-control"
                      placeholder="Value (e.g., STEQ)"
                      aria-label="Specification value"
                    />
                    <div class="btn-group btn-group-sm">
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="moveSpecUp('create', i)"
                        :disabled="i === 0"
                        title="Move up"
                      >
                        <i class="bi bi-arrow-up"></i>
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="moveSpecDown('create', i)"
                        :disabled="i === form.specList.length - 1"
                        title="Move down"
                      >
                        <i class="bi bi-arrow-down"></i>
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-danger"
                        @click="removeSpec('create', i)"
                        title="Remove"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-between mt-2">
                  <div class="text-danger small" v-if="!specsOk">
                    Each row needs a non-empty <strong>Key</strong>. Values can be empty.
                  </div>
                  <div class="d-flex gap-2">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      @click="addSpec('create')"
                    >
                      + Add row
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      @click="clearSpecs('create')"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              </div>
              <!-- ===== /Friendly Specifications Editor (Create) ===== -->
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="closeForm"
                :disabled="submitting"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting || !canSubmit">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                Save Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ===== Edit Product Modal (ALL FIELDS) ===== -->
    <div v-if="showEdit" class="modal-backdrop-custom">
      <div class="modal-card card shadow-lg">
        <div class="card-header d-flex justify-content-between align-items-center">
          <strong>Edit Product</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="closeEdit">✕</button>
        </div>

        <div class="card-body">
          <div v-if="!currentEdit">Missing product.</div>
          <template v-else>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Name</label>
                <input
                  v-model.trim="editForm.name"
                  type="text"
                  class="form-control"
                  placeholder="USB Drive"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Price (₱)</label>
                <input
                  v-model.number="editForm.price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Supplier Price (₱)</label>
                <input
                  v-model.number="editForm.supplier_price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  :class="{ 'is-invalid': !editSupplierOk }"
                  required
                />
                <div class="invalid-feedback">Supplier price must be &lt; Price and ≥ 0.</div>
              </div>

              <div class="col-12">
                <label class="form-label">Description (optional)</label>
                <textarea
                  v-model.trim="editForm.description"
                  rows="3"
                  class="form-control"
                  placeholder="Short description…"
                ></textarea>
              </div>

              <div class="col-md-6">
                <label class="form-label">Warranty (optional)</label>
                <input
                  v-model.trim="editForm.warranty"
                  type="text"
                  class="form-control"
                  placeholder="12 months parts & labor"
                />
              </div>

              <!-- ===== Friendly Specifications Editor (Edit) ===== -->
              <div class="col-12">
                <label class="form-label mb-2">Specifications (optional)</label>

                <div class="spec-rows">
                  <div class="spec-row" v-for="(row, i) in editForm.specList" :key="row._key">
                    <input
                      v-model.trim="row.key"
                      type="text"
                      class="form-control"
                      placeholder="Key (e.g., Model)"
                      aria-label="Specification key"
                    />
                    <input
                      v-model.trim="row.value"
                      type="text"
                      class="form-control"
                      placeholder="Value (e.g., S100)"
                      aria-label="Specification value"
                    />
                    <div class="btn-group btn-group-sm">
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="moveSpecUp('edit', i)"
                        :disabled="i === 0"
                        title="Move up"
                      >
                        <i class="bi bi-arrow-up"></i>
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="moveSpecDown('edit', i)"
                        :disabled="i === editForm.specList.length - 1"
                        title="Move down"
                      >
                        <i class="bi bi-arrow-down"></i>
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-danger"
                        @click="removeSpec('edit', i)"
                        title="Remove"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-between mt-2">
                  <div class="text-danger small" v-if="!editSpecsOk">
                    Each row needs a non-empty <strong>Key</strong>.
                  </div>
                  <div class="d-flex gap-2">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      @click="addSpec('edit')"
                    >
                      + Add row
                    </button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      @click="clearSpecs('edit')"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              </div>
              <!-- ===== /Friendly Specifications Editor (Edit) ===== -->

              <!-- Photos -->
              <div class="col-12">
                <div class="mb-2 small text-muted">
                  Manage photos (keep total between <strong>1–5</strong>).
                </div>

                <!-- Existing photos with remove X -->
                <div class="preview-grid">
                  <div
                    class="preview-item"
                    v-for="(path, i) in editExisting"
                    :key="`ex-${i}-${path}`"
                  >
                    <img :src="signedForExisting(path)" alt="" />
                    <button
                      type="button"
                      class="btn btn-danger btn-xs remove-x"
                      title="Remove this photo"
                      @click="toggleRemoveExisting(path)"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="remove-mask" v-if="toRemove.has(path)">
                      <i class="bi bi-trash"></i> Marked for deletion
                    </div>
                  </div>

                  <!-- New photos previews -->
                  <div
                    class="preview-item"
                    v-for="(p, i) in editNewPreviews"
                    :key="`new-${i}-${p.key}`"
                  >
                    <img :src="p.url" alt="" />
                    <button
                      type="button"
                      class="btn btn-danger btn-xs remove-x"
                      title="Remove this photo"
                      @click="removeNewAt(i)"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>

                <!-- Add new photos -->
                <div class="mt-3">
                  <div
                    class="fb-dropzone"
                    :class="{ 'drag-over': editDraggingOver }"
                    @dragover.prevent="onEditDragOver"
                    @dragleave.prevent="onEditDragLeave"
                    @drop.prevent="onEditDrop"
                  >
                    <div class="text-center text-muted">
                      <i class="bi bi-images" style="font-size: 1.6rem"></i>
                      <div class="mt-2">Drag photos here or</div>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary mt-2"
                        @click="triggerEditFile"
                      >
                        Browse files
                      </button>
                      <div class="small mt-2">Max total 5 (existing + new)</div>
                    </div>
                    <input
                      ref="editFileInput"
                      type="file"
                      accept="image/*"
                      class="d-none"
                      multiple
                      @change="onEditFiles"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="closeEdit"
                :disabled="busy.editSave"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-primary"
                :disabled="busy.editSave || !editAllValid"
                @click="saveEdit"
              >
                <span v-if="busy.editSave" class="spinner-border spinner-border-sm me-2"></span>
                Save Changes
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- /Edit Product Modal -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

type ProductRow = {
  id: string
  name: string
  description: string | null
  price: number | string
  supplier_price: number | string
  product_url: string[]
  warranty?: string | null
  specifications?: any | null
  created_at: string
  updated_at: string
  ispublish: boolean
}

type SpecRow = { _key: string; key: string; value: string }

const products = ref<ProductRow[]>([])
const loading = ref(true)
const showForm = ref(false)
const submitting = ref(false)
const q = ref('')

/** modal state */
type FormMode = 'upload' | 'url'
const formMode = ref<FormMode>('upload')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const filePreviews = ref<{ key: string; url: string }[]>([])
const draggingOver = ref(false)

const urlPreviews = ref<{ key: string; url: string }[]>([])

const form = reactive({
  name: '',
  description: '',
  price: 0,
  supplier_price: 0,
  product_urls: [''] as string[],
  warranty: '' as string,
  specList: [] as SpecRow[], // rows only
})

/** helpers */
function randId() {
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
      return (crypto as any).randomUUID()
    }
  } catch {
    /* noop */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const number = (n: number | string | null | undefined) => Number(n ?? 0).toFixed(2)

const fmt = (x: string | null | undefined) => {
  if (!x) return '—'
  const d = new Date(x.replace(' ', 'T'))
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

/** slider state per product */
const indexMap = reactive<Record<string, number>>({})
const signedMap = reactive<Record<string, string>>({})
const imgBusy = reactive<Record<string, boolean>>({})

function currentIndex(id: string) {
  return indexMap[id] ?? 0
}
function setIndex(id: string, i: number) {
  indexMap[id] = i
}

/** directional slide control */
const slideDirMap = reactive<Record<string, 'left' | 'right'>>({})
function slideName(id: string) {
  return slideDirMap[id] === 'right' ? 'slide-right' : 'slide-left'
}

function next(p: ProductRow) {
  slideDirMap[p.id] = 'left'
  const i = currentIndex(p.id)
  setIndex(p.id, (i + 1) % Math.max(1, p.product_url.length))
}
function prev(id: string) {
  const p = products.value.find((x) => x.id === id)
  if (!p) return
  slideDirMap[id] = 'right'
  const i = currentIndex(id)
  const n = p.product_url.length
  setIndex(id, (i - 1 + n) % Math.max(1, n))
}
function isAnyImgBusy(p: ProductRow) {
  const i = currentIndex(p.id)
  return !!imgBusy[`${p.id}#${i}`]
}

function isStoragePath(u: string | null | undefined) {
  if (!u) return false
  return !/^https?:\/\//i.test(u)
}
function keyFor(p: ProductRow, idx: number) {
  return `${p.id}#${idx}`
}
function imageUrlAt(p: ProductRow, idx: number) {
  const arr = p.product_url
  if (!arr.length || !arr[idx]) return ''
  const src = arr[idx]
  if (!isStoragePath(src)) return src

  const k = keyFor(p, idx)
  if (signedMap[k]) return signedMap[k]
  if (!imgBusy[k]) {
    imgBusy[k] = true
    supabase.storage
      .from('prize_product')
      .createSignedUrl(src, 60 * 60)
      .then(({ data, error }) => {
        if (!error && data?.signedUrl) signedMap[k] = data.signedUrl
      })
      .finally(() => (imgBusy[k] = false))
  }
  return ''
}

/** fetch */
async function loadProducts() {
  loading.value = true
  const { data, error } = await supabase
    .schema('games')
    .from('products')
    .select(
      'id, name, description, price, supplier_price, product_url, warranty, specifications, created_at, updated_at, ispublish',
    )
    .order('created_at', { ascending: false })

  if (!error) {
    products.value = (data ?? []).map((row: any) => ({
      ...row,
      product_url: Array.isArray(row.product_url)
        ? row.product_url
        : row.product_url
          ? [row.product_url]
          : [],
      ispublish: !!row.ispublish,
    })) as ProductRow[]
  }
  loading.value = false
}

/** modal controls */
function openForm() {
  resetForm()
  showForm.value = true
}
function closeForm() {
  showForm.value = false
}
function resetForm() {
  form.name = ''
  form.description = ''
  form.price = 0
  form.supplier_price = 0
  form.product_urls = ['']
  form.warranty = ''
  form.specList = []
  // clear files + revoke previews
  selectedFiles.value = []
  filePreviews.value.forEach((p) => URL.revokeObjectURL(p.url))
  filePreviews.value = []
  urlPreviews.value = []
  if (fileInput.value) fileInput.value.value = ''
  formMode.value = 'upload'
}

/** drag & drop + file input */
function triggerFile() {
  fileInput.value?.click()
}
function onDragOver() {
  draggingOver.value = true
}
function onDragLeave() {
  draggingOver.value = false
}
function onDrop(e: DragEvent) {
  draggingOver.value = false
  const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'))
  appendFiles(files)
}
function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  appendFiles(files)
}
function appendFiles(files: File[]) {
  if (!files.length) return
  const available = Math.max(0, 5 - selectedFiles.value.length)
  const toAdd = files.slice(0, available)
  for (const f of toAdd) {
    selectedFiles.value.push(f)
    const url = URL.createObjectURL(f)
    filePreviews.value.push({ key: `${Date.now()}-${Math.random()}`, url })
  }
}

/** preview reorder/remove */
function moveUp(i: number) {
  if (i <= 0) return
  ;[selectedFiles.value[i - 1], selectedFiles.value[i]] = [
    selectedFiles.value[i],
    selectedFiles.value[i - 1],
  ]
  ;[filePreviews.value[i - 1], filePreviews.value[i]] = [
    filePreviews.value[i],
    filePreviews.value[i - 1],
  ]
}
function moveDown(i: number) {
  if (i >= selectedFiles.value.length - 1) return
  ;[selectedFiles.value[i + 1], selectedFiles.value[i]] = [
    selectedFiles.value[i],
    selectedFiles.value[i + 1],
  ]
  ;[filePreviews.value[i + 1], filePreviews.value[i]] = [
    filePreviews.value[i],
    filePreviews.value[i + 1],
  ]
}
function removeAt(i: number) {
  const [removed] = filePreviews.value.splice(i, 1)
  if (removed) URL.revokeObjectURL(removed.url)
  selectedFiles.value.splice(i, 1)
}

/** URL mode helpers */
function addUrlField() {
  if (form.product_urls.length < 5) form.product_urls.push('')
}
function trimEmptyUrls() {
  const cleaned = form.product_urls.map((s) => s.trim()).filter(Boolean)
  form.product_urls = cleaned.length ? cleaned : ['']
  buildUrlPreviews()
}
function removeUrl(i: number) {
  form.product_urls.splice(i, 1)
  if (!form.product_urls.length) form.product_urls.push('')
  buildUrlPreviews()
}
function previewUrl(i: number) {
  buildUrlPreviews()
}
function buildUrlPreviews() {
  const urls = form.product_urls
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5)
  urlPreviews.value = urls.map((u) => ({ key: u, url: u }))
}

/** specifications helpers (rows <-> object) */
function newSpecRow(key = '', value = ''): SpecRow {
  return { _key: randId(), key, value }
}
function rowsToObject(rows: SpecRow[]): Record<string, any> {
  const obj: Record<string, any> = {}
  rows.forEach((r) => {
    const k = (r.key || '').trim()
    if (!k) return
    obj[k] = r.value ?? ''
  })
  return obj
}
function objectToRows(obj: any): SpecRow[] {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return []
  return Object.entries(obj).map(([k, v]) => newSpecRow(String(k), v == null ? '' : String(v)))
}

/** validation */
const supplierOk = computed(() => {
  const sp = Number(form.supplier_price)
  const p = Number(form.price)
  if (isNaN(sp) || isNaN(p)) return false
  return sp >= 0 && sp < p
})
const specsOk = computed(() => {
  return form.specList.every((r) => (r.key || '').trim().length > 0)
})
const imagesOk = computed(() => {
  if (formMode.value === 'upload') {
    return selectedFiles.value.length >= 1 && selectedFiles.value.length <= 5
  } else {
    const urls = form.product_urls.map((s) => s.trim()).filter(Boolean)
    return urls.length >= 1 && urls.length <= 5
  }
})
const canSubmit = computed(() => {
  if (!form.name || form.price < 0) return false
  if (!supplierOk.value) return false
  if (!specsOk.value) return false
  if (!imagesOk.value) return false
  return true
})

/** storage upload */
async function uploadToStorage(productId: string, file: File, index: number): Promise<string> {
  const safeExt = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]+/g, '')
  const path = `products/${productId}/${index + 1}_${Date.now()}.${safeExt || 'bin'}`
  const { error } = await supabase.storage
    .from('prize_product')
    .upload(path, file, { upsert: false })
  if (error) throw error
  return path
}

/** submit */
async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const productId = randId()
    const urls: string[] = []

    if (formMode.value === 'upload') {
      for (let i = 0; i < selectedFiles.value.length; i++) {
        const path = await uploadToStorage(productId, selectedFiles.value[i], i)
        urls.push(path)
      }
    } else {
      const cleaned = form.product_urls
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5)
      urls.push(...cleaned)
    }

    if (urls.length < 1 || urls.length > 5) {
      alert('Please provide 1 to 5 images.')
      return
    }

    const specificationsObj = rowsToObject(form.specList)

    const payload = {
      id: productId,
      name: form.name.trim(),
      description: form.description?.trim() || null,
      price: Number(form.price),
      supplier_price: Number(form.supplier_price),
      product_url: urls,
      warranty: form.warranty?.trim() || null,
      specifications: Object.keys(specificationsObj).length ? specificationsObj : null,
    }

    if (!(payload.supplier_price >= 0 && payload.supplier_price < payload.price)) {
      alert('Supplier price must be lower than Price.')
      return
    }

    const { error } = await supabase.schema('games').from('products').insert(payload)

    if (error) {
      console.error('insert product error:', error.message)
      alert(error.message)
      return
    }

    closeForm()
    await loadProducts()
  } finally {
    submitting.value = false
  }
}

/** search */
const filteredProducts = computed(() => {
  const s = q.value.toLowerCase().trim()
  if (!s) return products.value
  return products.value.filter((p) => {
    return p.name.toLowerCase().includes(s) || (p.description ?? '').toLowerCase().includes(s)
  })
})

/** SWIPE/DRAG SUPPORT */
const swipeStartX = ref<number | null>(null)
const swipeDeltaX = ref(0)
const swipeActiveId = ref<string | null>(null)
const isMouseDown = ref(false)
const SWIPE_THRESHOLD = 30

function onTouchStart(e: TouchEvent, id: string) {
  swipeStartX.value = e.touches[0].clientX
  swipeDeltaX.value = 0
  swipeActiveId.value = id
}
function onTouchMove(e: TouchEvent) {
  if (swipeStartX.value === null) return
  swipeDeltaX.value = e.touches[0].clientX - swipeStartX.value
}
function onTouchEnd(p: ProductRow) {
  finishSwipe(p)
}

function onMouseDown(e: MouseEvent, id: string) {
  isMouseDown.value = true
  swipeStartX.value = e.clientX
  swipeDeltaX.value = 0
  swipeActiveId.value = id
}
function onMouseMove(e: MouseEvent) {
  if (!isMouseDown.value || swipeStartX.value === null) return
  swipeDeltaX.value = e.clientX - swipeStartX.value
}
function onMouseUp(p: ProductRow) {
  if (!isMouseDown.value) return
  isMouseDown.value = false
  finishSwipe(p)
}
function onMouseLeave() {
  isMouseDown.value = false
  swipeStartX.value = null
  swipeDeltaX.value = 0
  swipeActiveId.value = null
}
function finishSwipe(p: ProductRow) {
  if (swipeActiveId.value !== p.id) {
    swipeStartX.value = null
    swipeDeltaX.value = 0
    swipeActiveId.value = null
    return
  }
  const dx = swipeDeltaX.value
  swipeStartX.value = null
  swipeDeltaX.value = 0
  swipeActiveId.value = null

  if (Math.abs(dx) < SWIPE_THRESHOLD) return
  if (dx < 0) {
    slideDirMap[p.id] = 'left'
    next(p)
  } else {
    slideDirMap[p.id] = 'right'
    prev(p.id)
  }
}
function swipeStyle(id: string) {
  if (swipeActiveId.value !== id) return {}
  return { transform: `translateX(${swipeDeltaX.value}px)`, transition: 'transform 0s' }
}

/** Publish toggle, Edit & Delete */
async function togglePublish(p: ProductRow) {
  const nextVal = !p.ispublish
  const { error } = await supabase
    .schema('games')
    .from('products')
    .update({ ispublish: nextVal })
    .eq('id', p.id)
  if (error) {
    alert('Failed to update publish state: ' + error.message)
    return
  }
  p.ispublish = nextVal
}

const busy = reactive({ editSave: false, deleting: false })

async function deleteProduct(p: ProductRow) {
  if (!confirm(`Delete "${p.name}"? This will also delete its photos.`)) return
  busy.deleting = true
  try {
    await deleteAllInFolder(p.id)
    const { error } = await supabase.schema('games').from('products').delete().eq('id', p.id)
    if (error) {
      alert('Failed to delete product: ' + error.message)
      return
    }
    await loadProducts()
  } finally {
    busy.deleting = false
  }
}

async function deleteAllInFolder(productId: string) {
  const folder = `products/${productId}`
  const { data } = await supabase.storage.from('prize_product').list(folder, { limit: 100 })
  const paths = (data ?? []).map((obj) => `${folder}/${obj.name}`)
  if (paths.length) {
    const { error: remErr } = await supabase.storage.from('prize_product').remove(paths)
    if (remErr) {
      throw remErr
    }
  }
}

/** Edit modal state */
const showEdit = ref(false)
const currentEdit = ref<ProductRow | null>(null)
const editExisting = ref<string[]>([])
const toRemove = reactive<Set<string>>(new Set())
const editNewFiles = ref<File[]>([])
const editNewPreviews = ref<{ key: string; url: string }[]>([])
const editFileInput = ref<HTMLInputElement | null>(null)
const editDraggingOver = ref(false)
const editSignedMap = reactive<Record<string, string>>({})

const editForm = reactive({
  name: '',
  description: '',
  price: 0 as number | string,
  supplier_price: 0 as number | string,
  warranty: '',
  specList: [] as SpecRow[],
})

function openEdit(p: ProductRow) {
  currentEdit.value = p
  editForm.name = p.name
  editForm.description = p.description ?? ''
  editForm.price = Number(p.price ?? 0)
  editForm.supplier_price = Number(p.supplier_price ?? 0)
  editForm.warranty = p.warranty ?? ''
  // specs -> rows
  try {
    const obj = p.specifications && typeof p.specifications === 'object' ? p.specifications : null
    editForm.specList = objectToRows(obj)
  } catch {
    editForm.specList = []
  }

  editExisting.value = [...p.product_url]
  toRemove.clear()
  editNewFiles.value = []
  editNewPreviews.value.forEach((v) => URL.revokeObjectURL(v.url))
  editNewPreviews.value = []
  showEdit.value = true
}
function closeEdit() {
  showEdit.value = false
  currentEdit.value = null
  editNewPreviews.value.forEach((v) => URL.revokeObjectURL(v.url))
  editNewPreviews.value = []
}

function signedForExisting(path: string) {
  if (!isStoragePath(path)) return path
  if (editSignedMap[path]) return editSignedMap[path]
  supabase.storage
    .from('prize_product')
    .createSignedUrl(path, 60 * 60)
    .then(({ data, error }) => {
      if (!error && data?.signedUrl) editSignedMap[path] = data.signedUrl
    })
  return ''
}

function toggleRemoveExisting(path: string) {
  if (toRemove.has(path)) toRemove.delete(path)
  else toRemove.add(path)
}
function triggerEditFile() {
  editFileInput.value?.click()
}
function onEditDragOver() {
  editDraggingOver.value = true
}
function onEditDragLeave() {
  editDraggingOver.value = false
}
function onEditDrop(e: DragEvent) {
  editDraggingOver.value = false
  const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'))
  appendEditFiles(files)
}
function onEditFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  appendEditFiles(files)
}
function appendEditFiles(files: File[]) {
  if (!files.length) return
  const keptExistingCount = editExisting.value.filter((p) => !toRemove.has(p)).length
  const available = Math.max(0, 5 - keptExistingCount - editNewFiles.value.length)
  const toAdd = files.slice(0, available)
  for (const f of toAdd) {
    editNewFiles.value.push(f)
    const url = URL.createObjectURL(f)
    editNewPreviews.value.push({ key: `${Date.now()}-${Math.random()}`, url })
  }
}
function removeNewAt(i: number) {
  const [v] = editNewPreviews.value.splice(i, 1)
  if (v) URL.revokeObjectURL(v.url)
  editNewFiles.value.splice(i, 1)
}

const editSupplierOk = computed(() => {
  const sp = Number(editForm.supplier_price)
  const p = Number(editForm.price)
  if (isNaN(sp) || isNaN(p)) return false
  return sp >= 0 && sp < p
})
const editSpecsOk = computed(() => {
  return editForm.specList.every((r) => (r.key || '').trim().length > 0)
})
const editPhotosOk = computed(() => {
  const kept = editExisting.value.filter((p) => !toRemove.has(p)).length
  const total = kept + editNewFiles.value.length
  return total >= 1 && total <= 5
})
const editAllValid = computed(() => {
  if (!editForm.name?.trim()) return false
  if (Number(editForm.price) < 0) return false
  if (!editSupplierOk.value) return false
  if (!editSpecsOk.value) return false
  if (!editPhotosOk.value) return false
  return true
})

function swap<T>(arr: T[], i: number, j: number) {
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}
function addSpec(which: 'create' | 'edit') {
  const row = newSpecRow()
  if (which === 'create') form.specList.push(row)
  else editForm.specList.push(row)
}
function removeSpec(which: 'create' | 'edit', i: number) {
  if (which === 'create') form.specList.splice(i, 1)
  else editForm.specList.splice(i, 1)
}
function moveSpecUp(which: 'create' | 'edit', i: number) {
  if (i <= 0) return
  if (which === 'create') swap(form.specList, i, i - 1)
  else swap(editForm.specList, i, i - 1)
}
function moveSpecDown(which: 'create' | 'edit', i: number) {
  if (which === 'create') {
    if (i >= form.specList.length - 1) return
    swap(form.specList, i, i + 1)
  } else {
    if (i >= editForm.specList.length - 1) return
    swap(editForm.specList, i, i + 1)
  }
}
function clearSpecs(which: 'create' | 'edit') {
  if (which === 'create') form.specList = []
  else editForm.specList = []
}

async function saveEdit() {
  if (!currentEdit.value) return
  if (!editAllValid.value) {
    alert('Please fix validation errors first.')
    return
  }
  busy.editSave = true
  try {
    const productId = currentEdit.value.id

    // delete removed existing storage files
    const toDel = [...toRemove].filter((p) => isStoragePath(p))
    if (toDel.length) {
      const { error: delErr } = await supabase.storage.from('prize_product').remove(toDel)
      if (delErr) {
        alert('Failed deleting old images: ' + delErr.message)
        return
      }
    }

    // upload new files
    const uploadedPaths: string[] = []
    for (let i = 0; i < editNewFiles.value.length; i++) {
      const path = await uploadToStorage(productId, editNewFiles.value[i], i)
      uploadedPaths.push(path)
    }

    // build final urls
    const keptExisting = editExisting.value.filter((p) => !toRemove.has(p))
    const finalUrls = [...keptExisting, ...uploadedPaths]
    if (finalUrls.length < 1 || finalUrls.length > 5) {
      alert('Total images must be between 1 and 5.')
      return
    }

    // build specs object from rows
    const specificationsObj = rowsToObject(editForm.specList)

    const payload: Record<string, any> = {
      name: editForm.name.trim(),
      description: editForm.description?.trim() || null,
      price: Number(editForm.price),
      supplier_price: Number(editForm.supplier_price),
      warranty: editForm.warranty?.trim() || null,
      specifications: Object.keys(specificationsObj).length ? specificationsObj : null,
      product_url: finalUrls,
    }

    if (!(payload.supplier_price >= 0 && payload.supplier_price < payload.price)) {
      alert('Supplier price must be lower than Price.')
      return
    }

    const { error: upErr } = await supabase
      .schema('games')
      .from('products')
      .update(payload)
      .eq('id', productId)

    if (upErr) {
      alert('Failed to update product: ' + upErr.message)
      return
    }

    showEdit.value = false
    await loadProducts()
  } finally {
    busy.editSave = false
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.admin-products-page {
  padding: 1rem;
}

/* Cards */
.product-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  background: #fff;
  border-color: #e9ecef;
}
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
}
.object-fit-cover {
  object-fit: cover;
}

/* Ratio */
.ratio {
  position: relative;
  width: 100%;
}
.ratio-4x3 {
  padding-top: 75%;
}
.ratio > * {
  position: absolute;
  inset: 0;
}

/* Slider core */
.slider-btn {
  position: relative;
  top: 10%;
  
  border: 0;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.slider-btn:hover {
  background: rgba(0, 0, 0, 0.5);
}
.slider-btn.left {
  position: relative;
  left: -10px;
}
.slider-btn.right {
  position: relative;
  right: -30px;
}

.slider-dots {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0.5rem;
  display: flex;
  gap: 0.4rem;
}
.slider-dots-below {
  bottom: -18px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.dot.active {
  background: #ffdf6e;
  transform: scale(1.05);
}

.slider-touch {
  cursor: grab;
  user-select: none;
}
.slider-touch:active {
  cursor: grabbing;
}

.slider-card {
  position: relative;
  background: transparent;
  border-radius: 16px;
  overflow: visible;
}
.slider-card > img {
  border-radius: 16px;
}

.img-count-pill {
  left: 0.5rem;
  bottom: 0.5rem;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.product-card .ratio-4x3 {
  margin-bottom: 22px;
}

.fb-dropzone {
  border: 2px dashed #ced4da;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}
.fb-dropzone.drag-over {
  border-color: #0d6efd;
  background: #eef5ff;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}
.preview-item {
  position: relative;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
}
.preview-item img {
  display: block;
  width: 100%;
  height: 120px;
  object-fit: cover;
}
.preview-actions {
  position: absolute;
  right: 0.4rem;
  top: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.preview-actions .btn {
  padding: 0.15rem 0.35rem;
}

.btn-xs {
  padding: 0.1rem 0.35rem;
  font-size: 0.75rem;
  line-height: 1;
}
.remove-x {
  position: absolute;
  top: 0.35rem;
  right: 0.35rem;
}
.remove-mask {
  position: absolute;
  inset: 0;
  background: rgba(220, 53, 69, 0.15);
  display: grid;
  place-items: center;
  color: #dc3545;
  font-size: 0.85rem;
  font-weight: 600;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 1055;
}
.modal-card {
  width: min(900px, 95vw);
  max-height: 90vh;
  overflow: auto;
  border: 0;
  border-radius: 16px;
}
.card-header {
  background: #fff;
}
.input-group .form-control:focus {
  box-shadow: none;
}

.xsmall {
  font-size: 0.8rem;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.24s ease,
    opacity 0.24s ease;
  will-change: transform, opacity;
}
.slide-left-enter-from {
  transform: translateX(30%);
  opacity: 0;
}
.slide-left-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.slide-left-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-left-leave-to {
  transform: translateX(-30%);
  opacity: 0;
}
.slide-right-enter-from {
  transform: translateX(-30%);
  opacity: 0;
}
.slide-right-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.slide-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-right-leave-to {
  transform: translateX(30%);
  opacity: 0;
}

/* Clean, inside arrows */
.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.92);
  color: #2b2b2b;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease,
    opacity 0.15s ease;
  opacity: 0.95;
}
.slider-btn:hover,
.slider-btn:focus-visible {
  background: #fff;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
  transform: translateY(-50%) scale(1.04);
  outline: none;
}
.slider-btn.left {
  left: 8px;
}
.slider-btn.right {
  right: 8px;
}
.slider-btn i {
  font-size: 1.1rem;
  line-height: 1;
}

@media (max-width: 576px) {
  .slider-btn.left {
    left: 8px;
  }
  .slider-btn.right {
    right: 8px;
  }
}

.slider-card {
  overflow: visible;
}

/* Friendly Specs UI */
.spec-rows {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}
.spec-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.5rem;
  align-items: center;
}
@media (max-width: 576px) {
  .spec-row {
    grid-template-columns: 1fr 1fr;
  }
  .spec-row .btn-group {
    grid-column: 1 / -1;
  }
}
</style>
