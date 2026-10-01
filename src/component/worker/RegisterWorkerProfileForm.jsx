import  { useEffect, useState } from "react";
import { getListServiceCategory } from "../../api/categoryApi";
import { workerProfileSchema } from "../../validation/WorkerProfileSchema";
import { SelectField } from "../ui/SelectField";
import { InputField } from "../ui/InputField";
import { MultiSelectChips } from "../ui/MultiSelectChips";
import { useFormik } from "formik";


const PROVINCES = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

const WORK_AREAS = [
  "Nội thành / Trung tâm",
  "Ngoại thành",
  "Toàn tỉnh / thành phố",
  "Khu vực lân cận",
  "Toàn quốc",
];

export function RegisterWorkerProfileForm({ initialValues, onNext }) {
  const [categories, setCategories] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    getListServiceCategory()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() =>
        setFormError(
          "Không tải được danh sách chuyên môn. Vui lòng tải lại trang.",
        ),
      )
      .finally(() => setLoadingCategory(false));
  }, []);

  const formik = useFormik({
    initialValues: {
      provinceCity: "",
      operatingArea: "",
      experienceYears: "",
      categoryIds: [],
    },
    validationSchema: workerProfileSchema,
    validateOnBlur: true,
    onSubmit: (values) => {
      onNext(values);
    },
    // onSubmit: async (values, { setErrors, setSubmitting }) => {
    //   setFormError(null);
    //   try {
    //     const payload = {
    //       ...values,
    //       experienceYears: Number(values.experienceYears),
    //     };
    //     const response = await registerWorker(payload);
    //     if (onSuccess) {
    //       onSuccess(response);
    //     }
    //   } catch (err) {
    //     const parsed = parseApiError(err);

    //     if (parsed.code === "VALIDATION_ERROR" && parsed.errors) {
    //       setErrors(parsed.errors);
    //     } else if (parsed.code === "WORKER_PROFILE_EXISTS") {
    //       setFormError("Bạn đã đăng ký hồ sơ thợ rồi.");
    //     } else if (parsed.code === "INVALID_CATEGORY") {
    //       setFormError(
    //         "Một số chuyên môn đã chọn không còn hợp lệ. Vui lòng chọn lại.",
    //       );
    //     } else if (parsed.code === "USER_LOCKED") {
    //       setFormError(
    //         "Tài khoản của bạn đang bị khóa, không thể đăng ký hồ sơ thợ.",
    //       );
    //     } else {
    //       setFormError(parsed.message || "Có lỗi xảy ra, vui lòng thử lại.");
    //     }
    //   } finally {
    //     setSubmitting(false);
    //   }
    // },
  });

  const toggleCategory = (id) => {
    const current = formik.values.categoryIds;
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    formik.setFieldValue("categoryIds", next);
  };

  return (
    <form
      onSubmit={formik.handleSubmit}
      noValidate
      className="w-full flex flex-col"
    >
      {formError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SelectField
          label="Tỉnh/ Thành phố đang sinh sống"
          name="provinceCity"
          options={PROVINCES}
          value={formik.values.provinceCity}
          onChange={(v) => formik.setFieldValue("provinceCity", v)}
          onBlur={formik.handleBlur}
          error={
            formik.touched.provinceCity ? formik.errors.provinceCity : undefined
          }
        />

        <SelectField
          label="Bao phủ khu vực làm việc"
          name="operatingArea"
          options={WORK_AREAS}
          value={formik.values.operatingArea}
          onChange={(v) => formik.setFieldValue("operatingArea", v)}
          onBlur={formik.handleBlur}
          error={
            formik.touched.operatingArea
              ? formik.errors.operatingArea
              : undefined
          }
        />

        <div className="md:col-span-2">
          <InputField
            label="Kinh nghiệm làm việc (số năm)"
            name="experienceYears"
            type="number"
            placeholder="Nhập số năm kinh nghiệm"
            value={formik.values.experienceYears}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.experienceYears
                ? formik.errors.experienceYears
                : undefined
            }
          />
        </div>

        <div className="md:col-span-2">
          <MultiSelectChips
            label="Chuyên môn / Ngành nghề (chọn 1 hoặc nhiều)"
            options={categories.map((d) => ({
              id: d.id,
              label: d.name,
            }))}
            selectedIds={formik.values.categoryIds}
            onToggle={toggleCategory}
            loading={loadingCategory}
            error={
              formik.touched.categoryIds ? formik.errors.categoryIds : undefined
            }
          />
        </div>
      </div>

      {/* <div className="mt-6 flex items-start gap-3 w-full">
        <input
          type="checkbox"
          id="agreePolicy"
          name="agreePolicy"
          checked={formik.values.agreePolicy}
          onChange={formik.handleChange}
          className="mt-1 w-4 h-4 rounded border-gray-300 accent-orange-500 cursor-pointer flex-shrink-0"
        />
        <label
          htmlFor="agreePolicy"
          className="text-xs text-gray-400 leading-relaxed cursor-pointer flex-1"
        >
          Bằng việc bấm vào nút Đăng ký, tôi đồng ý rằng Thợ Nhà có thể thu
          thập, sử dụng và tiết lộ thông tin được tôi cung cấp theo{" "}
          <a
            href="#"
            className="underline hover:text-gray-700 transition-colors"
            style={{ color: "#F5820D" }}
          >
            Chính sách bảo vệ dữ liệu cá nhân
          </a>{" "}
          mà tôi đã đọc hiểu.
        </label>
      </div> */}
      {/* {formik.touched.agreePolicy && formik.errors.agreePolicy && (
        <p className="text-xs text-red-500 mt-1">
          {formik.errors.agreePolicy}
        </p>
      )} */}

      <div className="mt-6 w-full flex justify-center items-center">
        {/* <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-center flex justify-center items-center"
          style={{ background: "#111111" }}
        >
          {formik.isSubmitting ? "Đang gửi..." : "Đăng ký"}
        </button> */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 text-center flex justify-center items-center"
          style={{ background: "#111111" }}
        >
          Tiếp theo
        </button>
      </div>
    </form>
  );
}
