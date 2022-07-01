use unicode_segmentation::UnicodeSegmentation;

pub fn to_slug(s: &str) -> String {
    s.unicode_words().map(str::to_lowercase).collect::<Vec<String>>().join("_")
}